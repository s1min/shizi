import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const pagesJsonPath = path.resolve(process.cwd(), 'src/pages.json')

if (fs.existsSync(pagesJsonPath)) {
  fs.rmSync(pagesJsonPath, { force: true })
  console.log(`[pages] removed generated file: ${pagesJsonPath}`)
}
else {
  console.log('[pages] src/pages.json not found, skip cleanup')
}
