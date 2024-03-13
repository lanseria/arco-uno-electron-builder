import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import App from '/@/App.vue'

import '@unocss/reset/tailwind.css'
import '@arco-design/web-vue/dist/arco.css'
import '/@/assets/style/global.less'
import 'uno.css'

const app = createApp(App)

app.use(ArcoVue, {})
app.use(ArcoVueIcon)

app.mount('#app')
