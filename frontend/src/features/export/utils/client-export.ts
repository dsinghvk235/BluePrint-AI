import type { CanvasSnapshot } from '@/features/canvas/types/diagram'

/** Client-side PNG export from canvas snapshot via SVG rasterization. */
export async function exportCanvasToPng(
  snapshot: CanvasSnapshot,
  projectName: string,
  theme: 'light' | 'dark' = 'light',
): Promise<void> {
  const svg = buildSvgFromSnapshot(snapshot, projectName, theme)
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  const image = new Image()
  image.decoding = 'async'

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Failed to render PNG'))
    image.src = url
  })

  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 800
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    URL.revokeObjectURL(url)
    throw new Error('Canvas not supported')
  }
  ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, 0, 0)
  URL.revokeObjectURL(url)

  const pngUrl = canvas.toDataURL('image/png')
  const anchor = document.createElement('a')
  anchor.href = pngUrl
  anchor.download = `${slug(projectName)}.png`
  anchor.click()
}

function buildSvgFromSnapshot(
  snapshot: CanvasSnapshot,
  title: string,
  theme: 'light' | 'dark',
): string {
  const dark = theme === 'dark'
  const bg = dark ? '#0f172a' : '#ffffff'
  const stroke = dark ? '#64748b' : '#94a3b8'
  const fill = dark ? '#1e293b' : '#f8fafc'
  const text = dark ? '#f1f5f9' : '#0f172a'

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
<rect width="100%" height="100%" fill="${bg}"/>
<text x="24" y="32" font-family="Inter, sans-serif" font-size="18" fill="${text}">${escapeXml(title)}</text>`

  for (const edge of snapshot.edges) {
    const source = snapshot.nodes.find((n) => n.id === edge.source)
    const target = snapshot.nodes.find((n) => n.id === edge.target)
    if (!source || !target) continue
    const x1 = source.position.x + 100
    const y1 = source.position.y + 30
    const x2 = target.position.x + 100
    const y2 = target.position.y + 30
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2"/>`
  }

  for (const node of snapshot.nodes) {
    const label = node.data.label
    svg += `<rect x="${node.position.x}" y="${node.position.y}" width="200" height="60" rx="8" fill="${fill}" stroke="${stroke}"/>`
    svg += `<text x="${node.position.x + 12}" y="${node.position.y + 36}" font-family="Inter, sans-serif" font-size="13" fill="${text}">${escapeXml(label)}</text>`
  }

  svg += '</svg>'
  return svg
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
