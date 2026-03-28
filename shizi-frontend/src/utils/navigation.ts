export function canNavigateBack() {
  const pages = getCurrentPages()
  return pages.length > 1
}

export function navigateBackOrTo(url: string, isTab = false) {
  if (canNavigateBack()) {
    uni.navigateBack()
    return
  }

  if (isTab) {
    uni.switchTab({ url })
    return
  }

  uni.redirectTo({ url })
}
