import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 双向
  // getAwsCredentials: () => ipcRenderer.invoke('main:getAwsCredentials'),
  // uploadKMLFile: (args: any) => ipcRenderer.invoke('main:uploadKMLFile', args),
  // uploadTIFFile: (args: any) => ipcRenderer.invoke('main:uploadTIFFile', args),
  // uploadKMLFileToGeojson: (args: any) => ipcRenderer.invoke('main:uploadKMLFileToGeojson', args),
  // uploadShpFileToGeojson: (args: any) => ipcRenderer.invoke('main:uploadShpFileToGeojson', args),
  // b2eKmlToGeosjon: (args: any) => ipcRenderer.invoke('main:b2eKmlToGeosjon', args),
  // downloadKMLFileToGeojson: (args: any) => ipcRenderer.invoke('main:downloadKMLFileToGeojson', args),
  // fetchCityJson: (args: any) => ipcRenderer.invoke('main:fetchCityJson', args),
  reload: (args: any) => ipcRenderer.invoke('main:reload', args),
  // fetchVersions: (args: any) => ipcRenderer.invoke('main:fetchVersions', args),
  // openUrl: (args: any) => ipcRenderer.invoke('main:openUrl', args),
})
/**
 * @module preload
 */

export { sha256sum } from './nodeCrypto'
export { versions } from './versions'
export { deleteTileset } from './fetch'
