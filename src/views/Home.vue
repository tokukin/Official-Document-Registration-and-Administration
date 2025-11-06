<template>
  <el-container class="welcome-container">
    <!-- 顶部导航栏 -->
    <el-header class="welcome-header">
      <div class="header-left">
        <span class="system-name">公文登记督办系统</span>
      </div>
      <div class="header-right">
        <el-text class="mx-1" type="danger">非涉密系统严禁传输涉密文件</el-text>
      </div>
    </el-header>

    <!-- 主体内容区 -->
    <el-main class="welcome-main">
      <!-- 欢迎横幅 -->
      <el-card class="welcome-banner" shadow="hover">
        <div class="banner-content">
          <div class="banner-text">
            <h1>
              <el-icon><OfficeBuilding /></el-icon>欢迎使用本系统！
            </h1>

            <p class="welcome-desc">开心每一天！</p>
          </div>
          <div class="banner-stats"></div>
        </div>
      </el-card>

      <!-- 功能入口卡片 -->
      <div class="function-cards">
        <el-card
          class="function-card task-icon"
          shadow="hover"
          @click="handleNavigate('/document/todo')"
        >
          <div class="card-info">
            <h3>任务中心</h3>
            <p>查看待办文件</p>
          </div>
        </el-card>

        <el-card
          class="function-card doc-icon"
          shadow="hover"
          @click="handleNavigate('/document')"
        >
          <div class="card-info">
            <h3>公文管理</h3>
            <p>管理公文的创建、删除</p>
          </div>
        </el-card>

        <el-card
          class="function-card org-icon"
          shadow="hover"
          @click="handleNavigate('/settings/org')"
        >
          <div class="card-info">
            <h3>组织配置</h3>
            <p>管理组织架构、部门信息</p>
          </div>
        </el-card>

        <el-card
          class="function-card user-icon"
          shadow="hover"
          @click="handleNavigate('/settings/emp')"
        >
          <div class="card-info">
            <h3>人员配置</h3>
            <p>配置人员信息</p>
          </div>
        </el-card>

        <el-card
          class="function-card stat-icon"
          shadow="hover"
          @click="handleNavigate('/statistics')"
        >
          <div class="card-info">
            <h3>统计分析</h3>
            <p>查看系统统计数据</p>
          </div>
        </el-card>
      </div>
    </el-main>

    <!-- 底部版权信息 -->
    <el-footer class="welcome-footer">
      <p>© 2025 管理系统 - 版权所有</p>
    </el-footer>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ElMessage,
  ElStatistic,
  ElAvatar,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from "element-plus";

// 路由实例
const router = useRouter();

// 用户信息（实际项目中从登录态或接口获取）
const userInfo = ref({
  name: "张经理",
  role: "管理员",
  avatar: "",
});

// 统计数据（实际项目中从接口获取）
const totalOrg = ref(28); // 组织总数
const totalUser = ref(156); // 用户总数
const pendingTask = ref(5); // 待处理任务数

// 日期相关
const currentDate = computed(() => {
  return new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
});
const lastLoginTime = ref("2025-10-28 09:15:30"); // 上次登录时间（实际从接口获取）

// 页面加载时初始化
onMounted(() => {
  // 模拟接口请求用户信息和统计数据
  console.log("欢迎页面加载完成");
});

// 导航到功能页面
const handleNavigate = (path) => {
  router.push(path);
};

// 个人中心
const handleProfile = () => {
  router.push("/profile");
};

// 退出登录
const handleLogout = () => {
  // 实际项目中清除登录态、token 等
  ElMessage.success("已成功退出登录");
  router.push("/login");
};
</script>

<style scoped>
/* 页面整体布局 */
.welcome-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 顶部导航栏 */
.welcome-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 36px;
  height: 36px;
}

.system-name {
  font-size: 18px;
  font-weight: 500;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
}

.user-name {
  font-size: 14px;
  color: #333;
}

.dropdown-icon {
  font-size: 14px;
  color: #666;
}

/* 主体内容区 */
.welcome-main {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

/* 欢迎横幅 */
.welcome-banner {
  margin-bottom: 24px;
  background: linear-gradient(135deg, lab(54.92% 67.63 42.6) 0%, #ff0000 100%);
  color: #fff;
  border: none;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.banner-text h1 {
  font-size: 24px;
  margin: 0 0 8px 0;
}

.welcome-desc {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.banner-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

/* 功能入口卡片 */
.function-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.function-card {
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  background-color: #fff;
}

.function-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  font-size: 24px;
  color: #fff;
  background-color: #42b983;
}

.org-icon {
  background-color: #42b983;
}

.user-icon {
  background-color: #3b82f6;
}

.doc-icon {
  background-color: #8b5cf6;
}

.task-icon {
  background-color: #f59e0b;
}

.user-icon {
  background-color: #f63b83;
}

.stat-icon {
  background-color: #3af50b;
}

.card-info {
  text-align: center;
}

.card-info h3 {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #fff;
}

.card-info p {
  font-size: 12px;
  color: #fff;
  margin: 0;
}

/* 底部版权信息 */
.welcome-footer {
  background-color: #fff;
  text-align: center;
  padding: 16px;
  font-size: 12px;
  color: #6b7280;
  border-top: 1px solid #eee;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .banner-stats {
    width: 100%;
    justify-content: space-between;
    gap: 16px;
  }

  .function-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .system-name {
    display: none;
  }
}

@media (max-width: 480px) {
  .function-cards {
    grid-template-columns: 1fr;
  }

  .user-name {
    display: none;
  }
}
</style>
