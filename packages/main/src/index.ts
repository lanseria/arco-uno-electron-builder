import { app } from 'electron'
import { platform } from 'node:process'
import './security-restrictions'
import { restoreOrCreateWindow } from '/@/mainWindow'

/**
 * 防止 Electron 运行多个实例。
 */
const isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
  app.quit()
  // eslint-disable-next-line node/prefer-global/process
  process.exit(0)
}
app.on('second-instance', restoreOrCreateWindow)

/**
 * 禁用硬件加速以节省更多系统资源。
 */
// app.disableHardwareAcceleration()

/**
 * 如果所有窗口都关闭，则关闭后台进程
 */
app.on('window-all-closed', () => {
  if (platform !== 'darwin')
    app.quit()
})

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow)

/**
 * 当后台进程准备就绪时创建应用程序窗口。
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch(e => console.error('无法创建窗口：', e))

/**
 * 仅在开发模式下安装 Vue.js 或任何其他扩展。
 * 注意：您必须手动安装 `electron-devtools-installer`
 */
// if (import.meta.env.DEV) {
//   app
//     .whenReady()
//     .then(() => import('electron-devtools-installer'))
//     .then(module => {
//       const {default: installExtension, VUEJS3_DEVTOOLS} =
//         // @ts-expect-error Hotfix for https://github.com/cawa-93/vite-electron-builder/issues/915
//         typeof module.default === 'function' ? module : (module.default as typeof module);
//
//       return installExtension(VUEJS3_DEVTOOLS, {
//         loadExtensionOptions: {
//           allowFileAccess: true,
//         },
//       });
//     })
//     .catch(e => console.error('Failed install extension:', e));
// }

/**
 * 检查应用程序更新，后台安装并通知用户已安装新版本。
 * 没有理由在非生产构建中运行此操作。
 * @see https://www.electron.build/auto-update.html#quick-setup-guide
 *
 * 注意：如果您在未将其发布到分发服务器的情况下编译生产应用程序，则可能会引发“ENOENT：没有这样的文件app-update.yml”。
 * 就像 `npm run compile` 一样。没关系 😅
 */
// if (import.meta.env.PROD) {
//   app
//     .whenReady()
//     .then(() => import('electron-updater'))
//     .then((module) => {
//       const autoUpdater
//         = module.autoUpdater
//         // @ts-expect-error Hotfix for https://github.com/electron-userland/electron-builder/issues/7338
//         || (module.default.autoUpdater as (typeof module)['autoUpdater'])
//       return autoUpdater.checkForUpdatesAndNotify()
//     })
//     .catch(e => console.error('检查和安装更新失败：', e))
// }
