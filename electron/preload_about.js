const { contextBridge } = require("electron");

// 暴露版本信息到渲染进程
contextBridge.exposeInMainWorld("appVersions", {
  APP_VERSION: "1.0.0", // 自定义应用版本
  ELECTRON_VERSION: process.versions.electron,
  CHROME_VERSION: process.versions.chrome,
  NODE_VERSION: process.versions.node,
  V8_VERSION: process.versions.v8,
  OS: process.platform === "win32" ? "Windows_NT" : process.platform, // 适配系统
  OS_ARCH: process.arch,
  OS_VERSION: process.getSystemVersion ? process.getSystemVersion() : "未知", // 系统版本（Electron 22+ 支持）
});
