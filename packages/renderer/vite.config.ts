/* eslint-env node */

import { join, resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import { renderer } from 'unplugin-auto-expose'
import Unocss from 'unocss/vite'
import { loadEnv } from 'vite'
import { chrome } from '../../.electron-vendors.cache.json'
import { injectAppVersion } from '../../version/inject-app-version-plugin.mjs'

const PACKAGE_ROOT = __dirname
const PROJECT_ROOT = join(PACKAGE_ROOT, '../..')

export default ({ mode }) => {
  const env = loadEnv(mode, PROJECT_ROOT)
  console.warn('renderer: ', PROJECT_ROOT)
  console.warn('renderer: ', env.VITE_TEST)
  return {
    // eslint-disable-next-line node/prefer-global/process
    mode: process.env.MODE,
    root: PACKAGE_ROOT,
    envDir: PROJECT_ROOT,
    resolve: {
      alias: {
        // root
        '/@/': `${join(PACKAGE_ROOT, 'src')}/`,
      },
    },
    base: '',
    server: {
      fs: {
        strict: true,
      },
    },
    build: {
      sourcemap: false,
      target: `chrome${chrome}`,
      outDir: 'dist',
      assetsDir: '.',
      rollupOptions: {
        input: join(PACKAGE_ROOT, 'index.html'),
      },
      emptyOutDir: true,
      reportCompressedSize: false,
    },
    test: {
      environment: 'happy-dom',
    },
    plugins: [
      Vue(),
      vueJsx(),
      // https://github.com/antfu/unplugin-auto-import
      AutoImport({
        resolvers: [ArcoResolver()],
        imports: [
          'vue',
          '@vueuse/core',
        ],
        dts: join(PACKAGE_ROOT, 'types/auto-imports.d.ts'),
        dirs: [
          join(PACKAGE_ROOT, 'src/composables'),
        ],
        vueTemplate: true,
      }),
      // https://github.com/antfu/vite-plugin-components
      Components({
        dts: join(PACKAGE_ROOT, 'types/components.d.ts'),
        resolvers: [
          ArcoResolver({
            resolveIcons: true,
            sideEffect: false,
          }),
        ],
      }),
      // https://github.com/antfu/unocss
      // see unocss.config.ts for config
      Unocss(),
      renderer.vite({
        preloadEntry: join(PACKAGE_ROOT, '../preload/src/index.ts'),
      }),
      injectAppVersion(),
    ],
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'arcoblue-6': '#02467D',
            'hack': `true; @import (reference) "${resolve(
              `${join(PACKAGE_ROOT, 'src/assets/style/breakpoint.less')}`,
            )}";`,
          },
          javascriptEnabled: true,
        },
      },
    },
  }
}
