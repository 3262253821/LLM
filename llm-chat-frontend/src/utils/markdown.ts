// markdown-it 是一个专门把 Markdown 字符串解析成 HTML 的库。
import MarkdownIt from 'markdown-it'
// highlight.js/lib/core作用是，“如果 Markdown 里有代码块，我帮你把代码按语言着色。”
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import plaintext from 'highlight.js/lib/languages/plaintext'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

function escapeHtml(content: string) {
  return content
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
// 注册 highlight.js 语言
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('plaintext', plaintext)
hljs.registerLanguage('text', plaintext)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('vue', xml)
hljs.registerLanguage('xml', xml)
// 创建 Markdown 解析器实例
const markdown = new MarkdownIt({
  // 不允许用户传进来的 HTML 直接生效
  html: false,
  // MarkdownIt 会自动把它识别成可点击链接。
  linkify: true,
  breaks: true,
  highlight(code: string, lang: string) {
    // toLowerCase 统一转成小写
    const language = lang.trim().toLowerCase()
    // 如果语言存在且已注册，就走高亮处理
    if (language && hljs.getLanguage(language)) {
      // 把原始代码字符串 code，按指定语言规则处理后，得到带高亮标签的 HTML 片段。
      const highlightedCode = hljs.highlight(code, {
        language,
        ignoreIllegals: true,
      }).value

      return `<pre class="markdown-pre"><code class="hljs language-${language}">${highlightedCode}</code></pre>`
    }

    return `<pre class="markdown-pre"><code class="hljs">${escapeHtml(code)}</code></pre>`
  },
})

export function renderMarkdown(content: string) {
  return markdown.render(content)
}
