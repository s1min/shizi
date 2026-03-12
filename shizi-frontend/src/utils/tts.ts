/**
 * 语音合成(TTS)工具
 * - 微信小程序：使用微信同声传译插件（审核中），暂用降级方案
 * - H5：使用 Web Speech API
 */

// 微信同声传译插件实例
let plugin: any = null
// 插件是否可用
let pluginAvailable = false

/**
 * 初始化 TTS 插件（仅微信小程序需要）
 */
export function initTTS() {
  // #ifdef MP-WEIXIN
  try {
    plugin = requirePlugin('WechatSI')
    // 检查插件是否真正可用
    if (plugin && typeof plugin.textToSpeech === 'function') {
      pluginAvailable = true
      console.log('[TTS] 插件加载成功')
    }
    else {
      console.log('[TTS] 插件未授权，使用降级方案')
    }
  }
  catch (e) {
    console.log('[TTS] 插件未安装，使用降级方案')
  }
  // #endif
}

/**
 * 播放汉字读音
 * @param text 要朗读的文字
 * @param pinyin 拼音（用于降级显示）
 * @param options 可选参数
 */
export function speakText(
  text: string,
  pinyin?: string,
  options: {
    lang?: string
    rate?: number
    onStart?: () => void
    onEnd?: () => void
    onError?: (err: any) => void
  } = {},
) {
  const { lang = 'zh_CN', rate = 0.8, onStart, onEnd, onError } = options

  // #ifdef MP-WEIXIN
  if (pluginAvailable && plugin) {
    // 使用同声传译插件
    onStart?.()
    plugin.textToSpeech({
      lang,
      tts: true,
      content: text,
      success: (res: any) => {
        const innerAudioContext = uni.createInnerAudioContext()
        innerAudioContext.src = res.filename
        innerAudioContext.onEnded(() => {
          onEnd?.()
          innerAudioContext.destroy()
        })
        innerAudioContext.onError((err: any) => {
          console.error('[TTS] 播放错误:', err)
          onError?.(err)
          innerAudioContext.destroy()
        })
        innerAudioContext.play()
      },
      fail: (err: any) => {
        console.error('[TTS] 合成失败:', err)
        fallbackSpeak(text, pinyin)
        onError?.(err)
      },
    })
  }
  else {
    // 降级方案：显示拼音提示
    fallbackSpeak(text, pinyin)
    onEnd?.()
  }
  // #endif

  // #ifdef H5
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = rate
    utterance.onstart = () => onStart?.()
    utterance.onend = () => onEnd?.()
    utterance.onerror = e => onError?.(e)
    window.speechSynthesis.speak(utterance)
  }
  else {
    fallbackSpeak(text, pinyin)
    onEnd?.()
  }
  // #endif

  // #ifdef APP-PLUS
  fallbackSpeak(text, pinyin)
  onEnd?.()
  // #endif
}

/**
 * 降级方案：显示拼音toast
 */
function fallbackSpeak(text: string, pinyin?: string) {
  const display = pinyin ? `${text} (${pinyin})` : text
  uni.showToast({
    title: display,
    icon: 'none',
    duration: 1500,
  })
}

/**
 * 停止播放
 */
export function stopSpeak() {
  // #ifdef H5
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  // #endif
}
