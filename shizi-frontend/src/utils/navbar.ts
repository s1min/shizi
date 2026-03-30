export interface CustomNavBarMetrics {
  statusBarHeight: number
  navBarHeight: number
  navBarPaddingTop: number
  navBarContentHeight: number
}

const DEFAULT_STATUS_BAR_HEIGHT = 24
const DEFAULT_NAV_BAR_CONTENT_HEIGHT = 44
const DEFAULT_VERTICAL_GAP = 8

function getDefaultMetrics(): CustomNavBarMetrics {
  const statusBarHeight = DEFAULT_STATUS_BAR_HEIGHT
  const navBarContentHeight = DEFAULT_NAV_BAR_CONTENT_HEIGHT
  return {
    statusBarHeight,
    navBarPaddingTop: statusBarHeight,
    navBarContentHeight,
    navBarHeight: statusBarHeight + navBarContentHeight,
  }
}

export function getCustomNavBarMetrics(): CustomNavBarMetrics {
  const fallback = getDefaultMetrics()

  // #ifdef MP-WEIXIN
  try {
    const systemInfo = uni.getSystemInfoSync()
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const statusBarHeight = systemInfo.statusBarHeight || fallback.statusBarHeight

    if (!menuButton || !menuButton.height || !menuButton.top) {
      return {
        statusBarHeight,
        navBarPaddingTop: statusBarHeight,
        navBarContentHeight: fallback.navBarContentHeight,
        navBarHeight: statusBarHeight + fallback.navBarContentHeight,
      }
    }

    const verticalGap = Math.max(menuButton.top - statusBarHeight, DEFAULT_VERTICAL_GAP)
    const navBarContentHeight = menuButton.height + verticalGap * 2

    return {
      statusBarHeight,
      navBarPaddingTop: statusBarHeight,
      navBarContentHeight,
      navBarHeight: statusBarHeight + navBarContentHeight,
    }
  }
  catch {
    return fallback
  }
  // #endif

  return fallback
}
