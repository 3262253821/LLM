export async function resizeAvatar(file: File, size = 240) {
  const supportedTypes = ['image/png', 'image/jpeg', 'image/webp']

  if (!supportedTypes.includes(file.type)) {
    throw new Error('头像仅支持 png、jpg、jpeg、webp 格式')
  }

  const imageUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(imageUrl)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('浏览器不支持头像处理')
    }

    canvas.width = size
    canvas.height = size

    const sourceSize = Math.min(image.width, image.height)
    const sourceX = (image.width - sourceSize) / 2
    const sourceY = (image.height - sourceSize) / 2

    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size)

    return canvas.toDataURL('image/webp', 0.9)
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片读取失败'))
    image.src = src
  })
}
