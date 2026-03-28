import { exec } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function resolveWeChatCliPath(platform) {
  const fromEnv = process.env.WECHAT_DEVTOOLS_CLI
  if (fromEnv && fs.existsSync(fromEnv))
    return fromEnv

  if (platform === 'darwin') {
    const candidates = [
      '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
      '/Applications/微信开发者工具.app/Contents/MacOS/cli',
    ]
    return candidates.find(p => fs.existsSync(p)) || ''
  }

  if (platform === 'win32') {
    const candidates = [
      'C:\\Program Files (x86)\\Tencent\\微信开发者工具\\cli.bat',
      'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
      'C:\\Program Files\\Tencent\\微信开发者工具\\cli.bat',
      'C:\\Program Files\\Tencent\\微信web开发者工具\\cli.bat',
    ]
    return candidates.find(p => fs.existsSync(p)) || ''
  }

  return ''
}

function resolveCommand(platform, uniPlatform, projectPath) {
  if (uniPlatform === 'mp-weixin') {
    const cliPath = resolveWeChatCliPath(platform)
    if (!cliPath)
      return ''
    return `"${cliPath}" -o "${projectPath}"`
  }

  if (uniPlatform === 'mp-alipay' && platform === 'darwin') {
    return `/Applications/小程序开发者工具.app/Contents/MacOS/小程序开发者工具 --p "${projectPath}"`
  }

  return ''
}

function openDevToolsImpl(env = 'dev') {
  const platform = process.platform
  const { UNI_PLATFORM } = process.env

  if (!UNI_PLATFORM || !UNI_PLATFORM.includes('mp'))
    return

  const outputDir = env === 'build' ? `dist/build/${UNI_PLATFORM}` : `dist/dev/${UNI_PLATFORM}`
  const projectPath = path.resolve(process.cwd(), outputDir)

  if (!fs.existsSync(projectPath)) {
    console.log(`[devtools] output directory not found: ${projectPath}`)
    return
  }

  const command = resolveCommand(platform, UNI_PLATFORM, projectPath)
  if (!command) {
    console.log(`[devtools] CLI not found for ${UNI_PLATFORM}, skip auto-open. Import manually: ${projectPath}`)
    return
  }

  console.log(`[devtools] opening ${UNI_PLATFORM} devtools...`)
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`[devtools] failed to open devtools: ${error.message}`)
      console.log(`[devtools] You can import project manually: ${projectPath}`)
      return
    }

    if (stderr)
      console.log(`[devtools] warning: ${stderr}`)

    if (stdout)
      console.log(stdout)
  })
}

export default function openDevTools(options = {}) {
  const { mode = 'development', enabled } = options

  const envFlag = process.env.UNI_AUTO_OPEN_DEVTOOLS
  const autoOpen =
    typeof enabled === 'boolean'
      ? enabled
      : (envFlag ? envFlag === 'true' : mode !== 'production')

  const env = mode === 'production' ? 'build' : 'dev'
  let isFirstBuild = true

  return {
    name: 'uni-devtools',
    writeBundle() {
      if (!autoOpen)
        return
      if (!isFirstBuild)
        return
      if (!process.env.UNI_PLATFORM?.includes('mp'))
        return

      isFirstBuild = false
      openDevToolsImpl(env)
    },
  }
}
