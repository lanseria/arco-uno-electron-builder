import { join, resolve } from 'node:path'
import { BrowserWindow, app, ipcMain, session } from 'electron'
import { getAwsCredentials, uploadKMLFile, uploadTIFFile } from './utils/aws'
import { b2eKmlToGeosjon, downloadKMLFileToGeojson, uploadKMLFileToGeojson, uploadShpFileToGeojson } from './utils/geojson'
import { fetchCityJson } from './utils/fetch'

async function createWindow() {
  const browserWindow = new BrowserWindow({
    minHeight: 960,
    minWidth: 1280,
    width: 1440,
    height: 960,
    show: false, // 使用'ready-to-show'事件来显示已实例化的BrowserWindow。
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // 演示预加载脚本依赖于Node.js api，因此禁用沙箱
      webviewTag: false, // 不建议使用webview标记。考虑使用iframe或Electron的BrowserView等替代方案。@see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
  })
  // 如果使用方法B，则应首先构造BrowserWindow
  const filter = { urls: ['*://*.mapbox.com/*', '*://*.jihulab.com/*'] }
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details!.requestHeaders!.Origin = 'http://localhost'
    details!.requestHeaders!.Referer = 'http://localhost/'
    // details.headers!.Origin = 'http://localhost'
    callback({ requestHeaders: details.requestHeaders })
  })
  /**
   * 如果BrowserWindow的构造函数的'show'属性从初始化选项中省略，则默认为'true'。
   * 这可能会导致窗口在加载html内容时闪烁，并且在关闭窗口时也会出现问题。
   * 使用`show：false`并侦听'ready-to-show'事件来显示窗口。
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show()
    if (import.meta.env.DEV)
      browserWindow?.webContents.openDevTools()
  })

  /**
   * 主窗口的URL。
   * Vite开发服务器用于开发。
   * 加载主窗口的主页面。
   */
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined) {
    /**
     * 从Vite dev服务器加载以进行开发。
     */
    await browserWindow.loadURL(import.meta.env.VITE_DEV_SERVER_URL)
  }
  else {
    /**
     * 从本地文件系统加载以进行生产和测试。
     *
     * 对于WhatWG URL API限制，请使用BrowserWindow.loadFile（）而不是BrowserWindow.loadURL（）
     * 当路径包含诸如“#”之类的特殊字符时。
     * 让电子来处理路径上的怪癖。
     * @see https://github.com/nodejs/node/issues/12682
     * @see https://github.com/electron/electron/issues/6869
     */
    await browserWindow.loadFile(resolve(__dirname, '../../renderer/dist/index.html'))
  }
  return browserWindow
}

/**
 * 恢复现有的BrowserWindow或创建新的BrowserWindow。
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed())
  if (window === undefined) {
    window = await createWindow()
    // 主 -> 渲染
    // 双向监听
    // ipcMain.handle('main:getAwsCredentials', getAwsCredentials) // 获取AWS凭证
    // ipcMain.handle('main:uploadKMLFile', (_event, args) => uploadKMLFile(args)) // 上传KML文件
    // ipcMain.handle('main:uploadTIFFile', (_event, args) => uploadTIFFile(args)) // 上传TIF文件
    // ipcMain.handle('main:uploadKMLFileToGeojson', (_event, _args) => uploadKMLFileToGeojson()) // 将KML文件上传到Geojson
    // ipcMain.handle('main:uploadShpFileToGeojson', (_event, _args) => uploadShpFileToGeojson()) // 将KML文件上传到Geojson
    // ipcMain.handle('main:b2eKmlToGeosjon', (_event, args) => b2eKmlToGeosjon(args)) // 将KML文件上传到Geojson
    // ipcMain.handle('main:downloadKMLFileToGeojson', (_event, _args) => downloadKMLFileToGeojson()) // 将KML文件下载为Geojson
    // ipcMain.handle('main:fetchCityJson', (_event, _args) => fetchCityJson()) // 获取城市JSON
    ipcMain.handle('main:reload', (_event, _args) => {
      window && window.reload()
    })
    // ipcMain.handle('main:fetchVersions', (_event, _args) => fetchVersions())
    // ipcMain.handle('main:openUrl', (event, args) => openUrl(args))
  }

  if (window.isMinimized())
    window.restore()

  window.focus()
}
