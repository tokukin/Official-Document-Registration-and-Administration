declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 添加Electron API类型声明
declare global {
  interface Window {
    electronAPI: {
      onNavigate: (callback: (path: string) => void) => void;
      // 可以根据需要添加其他API方法的类型声明
    };
  }
}

export {};
