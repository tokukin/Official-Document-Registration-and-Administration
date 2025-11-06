// electron/preload.js
// 绝对不能用 import！必须用 require！
const { contextBridge, ipcRenderer } = require("electron");

// 暴露接口到渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
  onNavigate: (callback) => {
    // 监听主进程发送的 'navigate' 事件
    ipcRenderer.on("navigate", (event, path) => {
      callback(path); // 调用渲染进程的回调函数
    });
  },

  // 组织管理相关接口
  getOrganizations: () => ipcRenderer.invoke("get-organizations"),
  addOrganization: (orgData) => ipcRenderer.invoke("add-organization", orgData),
  updateOrganization: (id, orgData) =>
    ipcRenderer.invoke("update-organization", id, orgData),
  deleteOrganization: (id) => ipcRenderer.invoke("delete-organization", id),

  // 员工管理相关接口
  getEmployees: () => ipcRenderer.invoke("get-employees"),
  addEmployee: (empData) => ipcRenderer.invoke("add-employee", empData),
  updateEmployee: (id, empData) =>
    ipcRenderer.invoke("update-employee", id, empData),
  deleteEmployee: (id) => ipcRenderer.invoke("delete-employee", id),

  // 公文管理相关接口
  getDocuments: () => ipcRenderer.invoke("get-documents"),
  addDocument: (docData) => ipcRenderer.invoke("add-document", docData),
  updateDocument: (id, docData) =>
    ipcRenderer.invoke("update-document", id, docData),
  deleteDocument: (id) => ipcRenderer.invoke("delete-document", id),

  // 在electronAPI对象末尾添加备份和恢复相关接口
  backupDatabase: (backupPath) =>
    ipcRenderer.invoke("backup-database", backupPath),
  restoreDatabase: (backupPath) =>
    ipcRenderer.invoke("restore-database", backupPath),
  // 添加文件对话框相关接口
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),

  // 统计相关接口
  getStatisticsSummary: () => ipcRenderer.invoke("get-statistics-summary"),
  getDailyDocumentStats: (startDate, endDate) =>
    ipcRenderer.invoke("get-daily-document-stats", startDate, endDate),
  getOrgDocumentStats: (startDate, endDate) =>
    ipcRenderer.invoke("get-org-document-stats", startDate, endDate),
});
