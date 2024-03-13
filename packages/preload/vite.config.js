import { join } from 'node:path'
import { preload } from 'unplugin-auto-expose'
import { loadEnv } from 'vite'
import { chrome } from '../../.electron-vendors.cache.json'
import { injectAppVersion } from '../../version/inject-app-version-plugin.mjs'

const PACKAGE_ROOT = __dirname
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..')

export default ({ mode }) => {
  const env = loadEnv(mode, PROJECT_ROOT)
  console.warn('preload: ', PROJECT_ROOT)
  console.warn('renderer: ', env.VITE_TEST)
  return {
    // eslint-disable-next-line node/prefer-global/process
    mode: process.env.MODE,
    root: PACKAGE_ROOT,
    envDir: PROJECT_ROOT,
    build: {
      ssr: true,
      sourcemap: 'inline',
      target: `chrome${chrome}`,
      outDir: 'dist',
      assetsDir: '.',
      // eslint-disable-next-line node/prefer-global/process
      minify: process.env.MODE !== 'development',
      lib: {
        entry: 'src/index.ts',
        formats: ['cjs'],
      },
      rollupOptions: {
        output: {
          entryFileNames: '[name].cjs',
        },
      },
      emptyOutDir: true,
      reportCompressedSize: false,
    },
    plugins: [preload.vite(), injectAppVersion()],
  }
}
