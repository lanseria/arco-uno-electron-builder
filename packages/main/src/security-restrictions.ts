import { URL } from 'node:url'
import type { Session } from 'electron'
import { app, shell } from 'electron'

/**
 * electron中所有现有权限的联合
 */
type Permission = Parameters<
  Exclude<Parameters<Session['setPermissionRequestHandler']>[0], null>
>[1]

/**
 * 允许在应用程序内打开的源列表及其权限。
 *
 * 在开发模式下，您需要允许打开 `VITE_DEV_SERVER_URL`。
 */
const ALLOWED_ORIGINS_AND_PERMISSIONS = new Map<string, Set<Permission>>(
  (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL)
    ? [[new URL(import.meta.env.VITE_DEV_SERVER_URL).origin, new Set()]]
    : [],
)

/**
 * 允许在浏览器中打开的源列表。
 * 只有在链接在新窗口中打开时才能导航到下面的源。
 *
 * @example
 * <a
 *   target="_blank"
 *   href="https://github.com/"
 * >
 */
const ALLOWED_EXTERNAL_ORIGINS = new Set<`https://${string}`>(
  [
    'https://github.com',
    'https://mapbox.com',
    'https://vuejs.org',
    'https://space.bilibili.com',
  ],
)

app.on('web-contents-created', (_, contents) => {
  /**
   * 阻止导航到不在允许列表中的源。
   *
   * 导航漏洞很常见。如果攻击者能够说服应用程序导航离开当前页面， 他们可能会强制应用程序在Web上打开任意Web资源/网站。
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
   */
  contents.on('will-navigate', (event, url) => {
    const { origin } = new URL(url)
    if (ALLOWED_ORIGINS_AND_PERMISSIONS.has(origin))
      return

    // 防止导航
    event.preventDefault()

    if (import.meta.env.DEV)
      console.warn(`已阻止导航到不允许的源：${origin}`)
  })

  /**
   *  阻止请求不允许的权限。
   * 默认情况下，Electron将自动批准所有权限请求。
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#5-handle-session-permission-requests-from-remote-content
   */
  contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const { origin } = new URL(webContents.getURL())

    const permissionGranted = !!ALLOWED_ORIGINS_AND_PERMISSIONS.get(origin)?.has(permission)
    callback(permissionGranted)

    if (!permissionGranted && import.meta.env.DEV)
      console.warn(`${origin}请求了'${permission}'权限，但被拒绝了。`)
  })

  /**
   * 在默认浏览器中打开指向允许站点的超链接。
   *
   * 创建新的 `webContents` 是一种常见的攻击向量。攻击者试图说服应用程序创建新的窗口、
   * 框架或其他渲染器进程，这些进程具有比以前更多的特权；或者打开他们以前无法打开的页面。
   * 您应该拒绝任何意外的窗口创建。
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#14-disable-or-limit-creation-of-new-windows
   * @see https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-openexternal-with-untrusted-content
   */
  contents.setWindowOpenHandler(({ url }) => {
    const { origin } = new URL(url)

    if (ALLOWED_EXTERNAL_ORIGINS.has(origin as `https://${string}`)) {
      // 在默认浏览器中打开url。
      shell.openExternal(url).catch(console.error)
    }
    else if (import.meta.env.DEV) {
      console.warn(`已阻止打开不允许的源：${origin}`)
    }

    // 防止创建新窗口。
    return { action: 'deny' }
  })

  /**
   * 在创建之前验证webview选项。
   *
   * 剥离预加载脚本，禁用Node.js集成，并确保源在允许列表中。
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#12-verify-webview-options-before-creation
   */
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    const { origin } = new URL(params.src)
    if (!ALLOWED_ORIGINS_AND_PERMISSIONS.has(origin)) {
      if (import.meta.env.DEV)
        console.warn(`Webview尝试附加${params.src}，但被阻止了。`)

      event.preventDefault()
      return
    }

    // 如果未使用预加载脚本或验证其位置是否合法，则剥离预加载脚本。
    delete webPreferences.preload
    // @ts-expect-error `preloadURL`存在。- @see https://www.electronjs.org/docs/latest/api/web-contents#event-will-attach-webview
    delete webPreferences.preloadURL

    // 禁用Node.js集成
    webPreferences.nodeIntegration = false

    // 启用contextIsolation
    webPreferences.contextIsolation = true
  })
})
