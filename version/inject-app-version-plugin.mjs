import { env } from 'node:process'
import { getVersion } from './getVersion.mjs'

/**
 * Somehow inject app version to vite build context
 * @return {import('vite').Plugin}
 */
export function injectAppVersion() {
  return {
    name: 'inject-version',
    config: () => {
    // TODO: Find better way to inject app version
      env.VITE_APP_VERSION = getVersion()
    },
  }
}
