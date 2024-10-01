import 'element-plus/dist/index.css';
import '@/assets/styles/index.scss';
import 'highlight.js/lib/common';
import 'highlight.js/scss/xcode.scss';
import Hljs from '@highlightjs/vue-plugin';
import { createApp } from 'vue';
import App from '@/App.vue';
import { router } from '@/route/index';

const app = createApp(App);
app.use(Hljs);
app.use(router).mount('#app');
