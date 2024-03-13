import { shell } from 'electron'

export function openUrl(url: string) {
  shell.openExternal(url)
}
