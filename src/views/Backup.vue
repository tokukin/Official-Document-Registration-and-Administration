<template>
  <el-container class="backup-container">
    <!-- 页面标题栏 -->
    <el-header class="page-header">
      <div class="header-content">
        <h1>数据备份&导出</h1>
      </div>
    </el-header>

    <!-- 主要内容区 -->
    <el-main class="main-content">
      <el-card class="backup-card">
        <template #header>
          <div class="card-header">
            <span>数据备份</span>
          </div>
        </template>

        <div class="backup-section">
          <el-row :gutter="20" type="flex" align="middle">
            <el-col :span="18">
              <el-input
                v-model="backupPath"
                placeholder="请选择备份文件保存位置"
                readonly
                class="backup-path-input"
              />
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="selectBackupPath"
                >选择路径</el-button
              >
            </el-col>
          </el-row>

          <div class="backup-info" v-if="dbInfo">
            <p>数据库文件位置: {{ dbInfo.dbPath }}</p>
            <p>备份文件名称: {{ dbInfo.backupFileName }}</p>
          </div>

          <div class="backup-actions">
            <el-button type="primary" size="large" @click="handleBackup">
              <el-icon><DocumentCopy /></el-icon>
              执行备份
            </el-button>
          </div>
        </div>
      </el-card>

      <el-card class="restore-card" style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>数据恢复</span>
          </div>
        </template>

        <div class="restore-section">
          <el-row :gutter="20" type="flex" align="middle">
            <el-col :span="18">
              <el-input
                v-model="restorePath"
                placeholder="请选择备份文件"
                readonly
                class="restore-path-input"
              />
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="selectRestorePath"
                >选择文件</el-button
              >
            </el-col>
          </el-row>

          <div class="restore-warning">
            <el-alert title="警告" type="warning" :closable="false">
              数据恢复将覆盖当前所有数据，请谨慎操作！建议在恢复前先执行备份。
            </el-alert>
          </div>

          <div class="restore-actions">
            <el-button type="danger" size="large" @click="handleRestore">
              <el-icon><RefreshLeft /></el-icon>
              执行恢复
            </el-button>
          </div>
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { DocumentCopy, RefreshLeft } from "@element-plus/icons-vue";

// 备份路径
const backupPath = ref("");
// 恢复路径
const restorePath = ref("");
// 数据库信息
const dbInfo = ref(null);

// 页面加载时初始化
onMounted(() => {
  // 设置默认的备份文件名称（使用当前日期时间）
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const backupFileName = `公文系统备份_${year}${month}${day}_${hours}${minutes}${seconds}.db`;

  // 假设数据库文件在src/db/app.db
  const dbFilePath = "src\\db\\app.db";

  dbInfo.value = {
    dbPath: dbFilePath,
    backupFileName: backupFileName,
  };
});

// 选择备份路径
const selectBackupPath = async () => {
  try {
    // 使用Electron的dialog模块选择文件夹
    const result = await window.electronAPI.showSaveDialog({
      title: "保存备份文件",
      defaultPath: dbInfo.value.backupFileName,
      filters: [{ name: "数据库备份文件", extensions: ["db"] }],
    });

    if (result.canceled === false) {
      backupPath.value = result.filePath;
    }
  } catch (error) {
    console.error("选择备份路径失败:", error);
    ElMessage.error("选择备份路径失败");
  }
};

// 执行备份
const handleBackup = async () => {
  if (!backupPath.value) {
    ElMessage.warning("请先选择备份文件保存位置");
    return;
  }

  try {
    ElMessage.info("开始备份数据库...");

    // 调用Electron API进行数据库备份
    const success = await window.electronAPI.backupDatabase(backupPath.value);

    if (success) {
      ElMessage.success("数据库备份成功");
    } else {
      ElMessage.error("数据库备份失败");
    }
  } catch (error) {
    console.error("备份数据库出错:", error);
    ElMessage.error("数据库备份失败: " + error.message);
  }
};

// 选择恢复文件
const selectRestorePath = async () => {
  try {
    // 使用Electron的dialog模块选择文件
    const result = await window.electronAPI.showOpenDialog({
      title: "选择备份文件",
      filters: [{ name: "数据库备份文件", extensions: ["db"] }],
      properties: ["openFile"],
    });

    if (result.canceled === false && result.filePaths.length > 0) {
      restorePath.value = result.filePaths[0];
    }
  } catch (error) {
    console.error("选择恢复文件失败:", error);
    ElMessage.error("选择恢复文件失败");
  }
};

// 执行恢复
const handleRestore = async () => {
  if (!restorePath.value) {
    ElMessage.warning("请先选择备份文件");
    return;
  }

  // 二次确认
  if (!confirm("确定要恢复数据吗？这将覆盖当前所有数据！")) {
    return;
  }

  try {
    ElMessage.info("开始恢复数据库...");

    // 调用Electron API进行数据库恢复
    const success = await window.electronAPI.restoreDatabase(restorePath.value);

    if (success) {
      ElMessage.success("数据库恢复成功，程序将重启");
      // 可以选择重启应用或刷新页面
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      ElMessage.error("数据库恢复失败");
    }
  } catch (error) {
    console.error("恢复数据库出错:", error);
    ElMessage.error("数据库恢复失败: " + error.message);
  }
};
</script>

<style scoped>
/* 页面整体布局 */
.backup-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 顶部导航栏 */
.page-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #1f2937;
}

/* 主体内容区 */
.main-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

/* 备份卡片 */
.backup-card,
.restore-card {
  background-color: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 备份和恢复区域 */
.backup-section,
.restore-section {
  padding: 20px 0;
}

.backup-path-input,
.restore-path-input {
  width: 100%;
}

.backup-info {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f2f5;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.backup-info p {
  margin: 5px 0;
}

.restore-warning {
  margin-top: 15px;
}

/* 操作按钮 */
.backup-actions,
.restore-actions {
  margin-top: 20px;
  text-align: center;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }

  .backup-section .el-row,
  .restore-section .el-row {
    flex-direction: column;
  }

  .backup-section .el-col,
  .restore-section .el-col {
    width: 100% !important;
    margin-bottom: 10px;
  }
}
</style>
