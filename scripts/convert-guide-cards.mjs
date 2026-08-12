// One-off: convert downloaded guide card PNGs to WebP and delete the PNGs.
import { createRequire } from 'node:module'
import { readdir, unlink, stat } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const sharp = require(
  path.resolve('node_modules/.pnpm/sharp@0.34.5/node_modules/sharp'),
)

const dir = 'public/cards'
const files = (await readdir(dir)).filter((f) => f.endsWith('.png'))

for (const file of files) {
  const src = path.join(dir, file)
  const dest = src.replace(/\.png$/, '.webp')
  await sharp(src).webp({ quality: 82 }).toFile(dest)
  const [inSize, outSize] = [(await stat(src)).size, (await stat(dest)).size]
  console.log(
    `${file}: ${(inSize / 1024).toFixed(0)} KB -> ${(outSize / 1024).toFixed(0)} KB`,
  )
  await unlink(src)
}
