import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { findChatStateByUserId, saveChatStateByUserId } from './repositories/chatStateRepository.js'
import {
  createUser,
  findUserByAccount,
  findUserById,
  findUserByUsername,
  updateUserPassword,
  updateUserProfile,
} from './repositories/userRepository.js'
import type { PersistedChatState, UserRecord } from './types.js'

dotenv.config()

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatStreamRequestBody {
  model?: string
  messages?: DeepSeekMessage[]
  temperature?: number
}

interface SaveChatStateRequestBody {
  state?: PersistedChatState
}

interface AuthRequest extends Request {
  user?: {
    userId: string
    account: string
    username: string
  }
}

interface UpdateProfileRequestBody {
  username?: string
  avatar?: string
}

interface UpdatePasswordRequestBody {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

interface RegisterRequestBody {
  account?: string
  username?: string
  password?: string
}

interface LoginRequestBody {
  account?: string
  password?: string
}

function normalizeTemperature(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 1
  }

  return Math.min(2, Math.max(0, value))
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`缺少 ${name} 配置`)
  }

  return value
}

function normalizeAccount(value: string) {
  return value.trim()
}

function createToken(userId: string, account: string, username: string) {
  const secret = getRequiredEnv('JWT_SECRET')

  return jwt.sign({ userId, account, username }, secret, {
    expiresIn: '7d',
  })
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const secret = getRequiredEnv('JWT_SECRET')
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        message: '未登录或登录已失效',
      },
    })
    return
  }

  const token = authorization.slice(7).trim()

  try {
    const payload = jwt.verify(token, secret) as {
      userId: string
      account: string
      username: string
    }

    req.user = {
      userId: payload.userId,
      account: payload.account,
      username: payload.username,
    }
    next()
  } catch {
    res.status(401).json({
      error: {
        message: '登录状态无效，请重新登录',
      },
    })
  }
}

const app = express()

app.use(cors())
app.use(express.json({ limit: '4mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const body = req.body as RegisterRequestBody
    const account = normalizeAccount(String(body.account ?? ''))
    const username = String(body.username ?? '').trim()
    const password = String(body.password ?? '').trim()

    if (!/^[a-zA-Z0-9_]{4,20}$/.test(account)) {
      res.status(400).json({
        error: {
          message: '账号需为 4 到 20 位字母、数字或下划线',
        },
      })
      return
    }

    if (!username) {
      res.status(400).json({
        error: {
          message: '用户名不能为空',
        },
      })
      return
    }

    if (password.length < 6) {
      res.status(400).json({
        error: {
          message: '密码至少 6 位',
        },
      })
      return
    }

    const accountExists = await findUserByAccount(account)

    if (accountExists) {
      res.status(409).json({
        error: {
          message: '账号已存在',
        },
      })
      return
    }

    const usernameExists = await findUserByUsername(username)

    if (usernameExists) {
      res.status(409).json({
        error: {
          message: '用户名已存在',
        },
      })
      return
    }

    const user: UserRecord = {
      id: String(Date.now()),
      account,
      username,
      passwordHash: await bcrypt.hash(password, 10),
      avatar: '',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }

    await createUser(user)

    const token = createToken(user.id, user.account, user.username)

    res.status(201).json({
      token,
      user: {
        id: user.id,
        account: user.account,
        username: user.username,
        avatar: user.avatar || '',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '注册失败'
    res.status(500).json({
      error: {
        message,
      },
    })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const body = req.body as LoginRequestBody
    const account = normalizeAccount(String(body.account ?? ''))
    const password = String(body.password ?? '').trim()

    const user = await findUserByAccount(account)

    if (!user) {
      res.status(401).json({
        error: {
          message: '账号或密码错误',
        },
      })
      return
    }

    const matched = await bcrypt.compare(password, user.passwordHash)

    if (!matched) {
      res.status(401).json({
        error: {
          message: '账号或密码错误',
        },
      })
      return
    }

    const token = createToken(user.id, user.account, user.username)

    res.json({
      token,
      user: {
        id: user.id,
        account: user.account,
        username: user.username,
        avatar: user.avatar || '',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败'
    res.status(500).json({
      error: {
        message,
      },
    })
  }
})

app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await findUserById(req.user!.userId)

    if (!user) {
      res.status(404).json({
        error: {
          message: '用户不存在',
        },
      })
      return
    }

    res.json({
      user: {
        id: user.id,
        account: user.account,
        username: user.username,
        avatar: user.avatar || '',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取用户信息失败'
    res.status(500).json({
      error: {
        message,
      },
    })
  }
})

app.put('/api/auth/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const body = req.body as UpdateProfileRequestBody
    const username = String(body.username ?? '').trim()
    const avatar = String(body.avatar ?? '').trim()

    if (!username) {
      res.status(400).json({
        error: {
          message: '用户名不能为空',
        },
      })
      return
    }

    const currentUser = await findUserById(req.user!.userId)

    if (!currentUser) {
      res.status(404).json({
        error: {
          message: '用户不存在',
        },
      })
      return
    }

    const duplicatedUser = await findUserByUsername(username)

    if (duplicatedUser && duplicatedUser.id !== currentUser.id) {
      res.status(409).json({
        error: {
          message: '用户名已存在',
        },
      })
      return
    }

    await updateUserProfile(currentUser.id, username, avatar)

    const token = createToken(currentUser.id, currentUser.account, username)

    res.json({
      token,
      user: {
        id: currentUser.id,
        account: currentUser.account,
        username,
        avatar,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新个人资料失败'
    res.status(500).json({
      error: {
        message,
      },
    })
  }
})

app.put('/api/auth/password', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const body = req.body as UpdatePasswordRequestBody
    const currentPassword = String(body.currentPassword ?? '').trim()
    const newPassword = String(body.newPassword ?? '').trim()
    const confirmPassword = String(body.confirmPassword ?? '').trim()

    if (newPassword.length < 6) {
      res.status(400).json({
        error: {
          message: '新密码至少 6 位',
        },
      })
      return
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        error: {
          message: '两次输入的新密码不一致',
        },
      })
      return
    }

    const currentUser = await findUserById(req.user!.userId)

    if (!currentUser) {
      res.status(404).json({
        error: {
          message: '用户不存在',
        },
      })
      return
    }

    const matched = await bcrypt.compare(currentPassword, currentUser.passwordHash)

    if (!matched) {
      res.status(401).json({
        error: {
          message: '当前密码错误',
        },
      })
      return
    }

    await updateUserPassword(currentUser.id, await bcrypt.hash(newPassword, 10))

    res.json({
      message: '密码修改成功',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '修改密码失败'
    res.status(500).json({
      error: {
        message,
      },
    })
  }
})

app.get('/api/chat/state', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const state = await findChatStateByUserId(req.user!.userId)

    res.json({
      state,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取聊天状态失败'
    res.status(500).json({
      error: {
        message,
      },
    })
  }
})

app.put('/api/chat/state', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const body = req.body as SaveChatStateRequestBody
    const state = body.state

    if (!state) {
      res.status(400).json({
        error: {
          message: '缺少 state',
        },
      })
      return
    }

    await saveChatStateByUserId(req.user!.userId, state)

    res.json({
      ok: true,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存聊天状态失败'
    res.status(500).json({
      error: {
        message,
      },
    })
  }
})

app.post('/api/chat/stream', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const baseUrl = getRequiredEnv('DEEPSEEK_BASE_URL')
    const apiKey = getRequiredEnv('DEEPSEEK_API_KEY')
    const defaultModel = getRequiredEnv('DEEPSEEK_DEFAULT_MODEL')

    const body = req.body as ChatStreamRequestBody
    const messages = Array.isArray(body.messages) ? body.messages : []

    if (messages.length === 0) {
      res.status(400).json({
        error: {
          message: 'messages 不能为空',
        },
      })
      return
    }

    const upstreamResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model || defaultModel,
        messages,
        temperature: normalizeTemperature(body.temperature),
        stream: true,
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text()

      res
        .status(upstreamResponse.status)
        .type('application/json')
        .send(
          errorText ||
            JSON.stringify({
              error: {
                message: '请求 DeepSeek 接口失败',
              },
            }),
        )
      return
    }

    if (!upstreamResponse.body) {
      res.status(500).json({
        error: {
          message: 'DeepSeek 未返回可读取的数据流',
        },
      })
      return
    }

    res.status(200)
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')

    const reader = upstreamResponse.body.getReader()
    const decoder = new TextDecoder()

    req.on('close', () => {
      reader.cancel().catch(() => {})
    })

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      res.write(decoder.decode(value, { stream: true }))
    }

    res.end()
  } catch (error) {
    const message = error instanceof Error ? error.message : '服务内部错误'

    if (!res.headersSent) {
      res.status(500).json({
        error: {
          message,
        },
      })
      return
    }

    res.end()
  }
})

const port = Number(process.env.PORT || 3001)

app.listen(port, () => {
  console.log(`llm-chat-server is running at http://localhost:${port}`)
})
