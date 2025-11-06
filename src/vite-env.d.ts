/// <reference types="vite/client" />

// 声明.vue文件的类型
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "vite-electron-plugin" {
  import type { Plugin } from "vite";
  interface ElectronPluginOptions {
    entry: string; // 根据插件实际参数补充其他配置项
    // 可选：添加更多你用到的配置类型，如：
    // vite?: import('vite').InlineConfig
  }
  const electron: (options: ElectronPluginOptions) => Plugin;
  export default electron;
}
