import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
// 导入路由实例（路径对应路由配置文件的位置）
import router from "./router";

// 1. 导入 Element Plus 全量样式
import "element-plus/dist/index.css";
// 2. 导入 Element Plus 全量组件
import ElementPlus from "element-plus";
// 3. 导入图标库（可选）
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// 创建 Vue 应用实例
const app = createApp(App);

// 注入路由实例（关键步骤）
app.use(router);
// 4. 全局注册 Element Plus 组件
app.use(ElementPlus);
// 5. 全局注册所有图标（可选）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 挂载应用到 DOM
app.mount("#app");
