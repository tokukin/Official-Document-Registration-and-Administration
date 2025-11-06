// 在文件开头添加electron模块的导入
const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");
const database = require("./database");

// 创建主窗口
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, // 必须开启，确保 contextBridge 生效
      nodeIntegration: false, // 保持关闭，遵循安全最佳实践
    },
    title: "公文登记督办系统-单机版",
  });

  mainWindow.loadURL(
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173"
      : `file://${path.join(__dirname, "../dist/index.html")}`
  );

  // 菜单模板
  const template = [
    {
      label: "首页·",
      click: () => {
        mainWindow.webContents.send("navigate", "/");
      },
    },
    {
      label: "待办公文",
      click: () => {
        mainWindow.webContents.send("navigate", "/document/todo");
      },
    },
    {
      label: "公文管理",
      click: () => {
        mainWindow.webContents.send("navigate", "/document");
      },
    },

    {
      label: "统计",
      click: () => {
        mainWindow.webContents.send("navigate", "/statistics");
      },
    },

    {
      label: "配置",
      submenu: [
        {
          label: "组织配置",
          click: () => {
            mainWindow.webContents.send("navigate", "/settings/org");
          },
        },
        {
          label: "人员配置",
          click: () => {
            mainWindow.webContents.send("navigate", "/settings/emp");
          },
        },
        {
          label: "数据备份&导出",
          click: () => {
            mainWindow.webContents.send("navigate", "/settings/backup");
          },
        },
      ],
    },

    {
      label: "帮助",
      click: () => {
        mainWindow.webContents.send("navigate", "/help");
      },
    },
    {
      label: "关于",
      click: () => {
        createAboutWindow();
      },
    },
    /*{
      label: "调试",
      submenu: [
        {
          label: "打开开发者工具",
          accelerator: "Ctrl+Shift+I",
          click: () => {
            mainWindow.webContents.openDevTools();
          },
        },
        {
          label: "刷新页面",
          accelerator: "F5",
          click: () => {
            mainWindow.webContents.reload();
          },
        },
      ],
    },*/
  ];

  // 设置菜单
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// 创建关于窗口
const createAboutWindow = () => {
  const aboutWindow = new BrowserWindow({
    width: 400,
    height: 420,
    webPreferences: {
      preload: path.join(__dirname, "preload_about.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "关于",
    autoHideMenuBar: true, // 自动隐藏菜单栏
    menu: null, // 完全禁用菜单
    resizable: false, // 不允许调整窗口大小
  });

  aboutWindow.loadFile(path.join(__dirname, "about.html"));
};

// 数据库相关IPC处理
// 组织管理相关
ipcMain.handle("get-organizations", async () => {
  try {
    return await database.getOrganizations();
  } catch (error) {
    console.error("获取组织列表失败:", error);
    throw error;
  }
});

ipcMain.handle("add-organization", async (_, orgData) => {
  try {
    return await database.addOrganization(orgData);
  } catch (error) {
    console.error("添加组织失败:", error);
    throw error;
  }
});

ipcMain.handle("update-organization", async (_, id, orgData) => {
  try {
    return await database.updateOrganization(id, orgData);
  } catch (error) {
    console.error("更新组织失败:", error);
    throw error;
  }
});

ipcMain.handle("delete-organization", async (_, id) => {
  try {
    return await database.deleteOrganization(id);
  } catch (error) {
    console.error("删除组织失败:", error);
    throw error;
  }
});

// 员工管理相关IPC处理
// 修复拼写错误：ippcMain -> ipcMain
ipcMain.handle("get-employees", async () => {
  try {
    return await database.getEmployees();
  } catch (error) {
    console.error("获取员工列表失败:", error);
    throw error;
  }
});

ipcMain.handle("add-employee", async (_, empData) => {
  try {
    return await database.addEmployee(empData);
  } catch (error) {
    console.error("添加员工失败:", error);
    throw error;
  }
});

ipcMain.handle("update-employee", async (_, id, empData) => {
  try {
    return await database.updateEmployee(id, empData);
  } catch (error) {
    console.error("更新员工失败:", error);
    throw error;
  }
});

ipcMain.handle("delete-employee", async (_, id) => {
  try {
    return await database.deleteEmployee(id);
  } catch (error) {
    console.error("删除员工失败:", error);
    throw error;
  }
});

// 在员工管理相关IPC处理后添加
// 统计相关IPC处理
ipcMain.handle("get-statistics-summary", async () => {
  try {
    return await database.getStatisticsSummary();
  } catch (error) {
    console.error("获取统计摘要失败:", error);
    throw error;
  }
});

ipcMain.handle("get-daily-document-stats", async (_, startDate, endDate) => {
  try {
    return await database.getDailyDocumentStats(startDate, endDate);
  } catch (error) {
    console.error("获取每日公文统计失败:", error);
    throw error;
  }
});

ipcMain.handle("get-org-document-stats", async (_, startDate, endDate) => {
  try {
    return await database.getOrgDocumentStats(startDate, endDate);
  } catch (error) {
    console.error("获取组织公文统计失败:", error);
    throw error;
  }
});

// 公文管理相关IPC处理
ipcMain.handle("get-documents", async () => {
  try {
    return await database.getDocuments();
  } catch (error) {
    console.error("获取公文列表失败:", error);
    throw error;
  }
});

ipcMain.handle("add-document", async (_, docData) => {
  try {
    return await database.addDocument(docData);
  } catch (error) {
    console.error("添加公文失败:", error);
    throw error;
  }
});

ipcMain.handle("update-document", async (_, id, docData) => {
  try {
    return await database.updateDocument(id, docData);
  } catch (error) {
    console.error("更新公文失败:", error);
    throw error;
  }
});

ipcMain.handle("delete-document", async (_, id) => {
  try {
    return await database.deleteDocument(id);
  } catch (error) {
    console.error("删除公文失败:", error);
    throw error;
  }
});

// 应用生命周期
app.whenReady().then(async () => {
  try {
    // 初始化数据库
    await database.init();
    console.log("数据库初始化成功");
  } catch (error) {
    console.error("数据库初始化失败:", error);
  }

  const userDataPath = app.getPath("userData");
  console.log("默认用户数据路径:", userDataPath); // 可在控制台查看实际路径

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 备份和恢复数据库相关IPC处理
ipcMain.handle("backup-database", async (_, backupPath) => {
  try {
    return await database.backupDatabase(backupPath);
  } catch (error) {
    console.error("备份数据库失败:", error);
    throw error;
  }
});

ipcMain.handle("restore-database", async (_, backupPath) => {
  try {
    return await database.restoreDatabase(backupPath);
  } catch (error) {
    console.error("恢复数据库失败:", error);
    throw error;
  }
});

// 添加文件对话框相关IPC处理
ipcMain.handle("show-save-dialog", async (_, options) => {
  return await dialog.showSaveDialog(null, options);
});

ipcMain.handle("show-open-dialog", async (_, options) => {
  return await dialog.showOpenDialog(null, options);
});

app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    try {
      await database.close();
    } catch (error) {
      console.error("关闭数据库失败:", error);
    }
    app.quit();
  }
});
