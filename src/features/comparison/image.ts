const MAX_SIDE = 2000

export type PreparedImage = {
  /** Base64 puro, sem o prefixo `data:` (contrato da API). */
  base64: string
  mediaType: 'image/jpeg'
  previewUrl: string
}

/** Reduz e recomprime o print no cliente: fica bem abaixo do limite de ~5 MB e envia menos dados. */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas indisponível')

  // JPEG não tem transparência: fundo branco evita PNG transparente virar preto.
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

  return {
    base64: dataUrl.slice(dataUrl.indexOf(',') + 1),
    mediaType: 'image/jpeg',
    previewUrl: dataUrl,
  }
}
