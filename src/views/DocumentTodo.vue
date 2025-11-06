<template>
  <el-container class="doc-config-container">
    <!-- 页面标题栏 -->
    <el-header class="page-header">
      <div class="header-content">
        <h1>公文待办</h1>
      </div>
    </el-header>

    <!-- 主要内容区 -->
    <el-main class="main-content">
      <!-- 搜索与筛选 -->
      <el-card class="search-card">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索公文名称"
              prefix-icon="Search"
              @keyup.enter="handleSearch"
            />
          </el-col>
          <el-col :span="8">
            <el-select
              v-model="selectedOrg"
              placeholder="筛选承办单位"
              clearable
              @change="handleSearch"
            >
              <el-option
                v-for="item in orgList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
            <el-button plain @click="resetSearch" style="margin-left: 10px">
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 公文列表表格 -->
      <el-card class="table-card" style="margin-top: 20px">
        <template v-if="loading">
          <el-empty description="数据加载中..." style="padding: 50px 0" />
        </template>
        <template v-else>
          <el-table
            ref="tableRef"
            :data="pagedDocList"
            border
            style="width: 100%"
            :row-key="(row) => row.id"
            row-class-name="fixed-height-row"
          >
            <el-table-column label="提醒" width="120" align="center">
              <template #default="scope">
                <!-- 给 el-tag 也加唯一 key（可选，增强稳定性） -->
                <el-tag
                  :key="scope.row.id + '-reminder'"
                  :type="getReminderType(scope.row.deadline)"
                >
                  {{ getReminderText(scope.row.deadline) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="title" label="公文名称" width="300">
              <template #default="scope">
                <el-tooltip
                  effect="dark"
                  :content="scope.row.title"
                  placement="top"
                  :disabled="false"
                >
                  <span class="ellipsis-cell">{{ scope.row.title }}</span>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column prop="documentNumber" label="公文编号" width="150">
              <template #default="scope">
                <el-tooltip
                  effect="dark"
                  :content="scope.row.documentNumber"
                  placement="top"
                  :disabled="false"
                >
                  <span class="ellipsis-cell">{{
                    scope.row.documentNumber
                  }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="documentType"
              label="文种"
              width="100"
              align="center"
            >
              <template #default="scope">
                <el-tooltip
                  effect="dark"
                  :content="scope.row.documentType"
                  placement="top"
                  :disabled="false"
                >
                  <span class="ellipsis-cell">{{
                    scope.row.documentType
                  }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="senderOrganization"
              label="来文单位"
              width="150"
              align="center"
            >
              <template #default="scope">
                <el-tooltip
                  effect="dark"
                  :content="scope.row.senderOrganization"
                  placement="top"
                  :disabled="false"
                >
                  <span class="ellipsis-cell">{{
                    scope.row.senderOrganization
                  }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="receiveDate"
              label="收文日期"
              width="120"
              align="center"
            />
            <el-table-column
              prop="deadline"
              label="办理时限"
              width="120"
              align="center"
            />
            <el-table-column prop="承办单位" label="承办单位" width="100">
              <template #default="scope">
                <el-tooltip
                  effect="dark"
                  :content="scope.row.承办单位"
                  placement="top"
                  :disabled="false"
                >
                  <span class="ellipsis-cell">{{ scope.row.承办单位 }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="承办人员" label="承办人员" width="150">
              <template #default="scope">
                <el-tooltip
                  effect="dark"
                  :content="scope.row.承办人员"
                  placement="top"
                  :disabled="false"
                >
                  <span class="ellipsis-cell">{{ scope.row.承办人员 }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="scope">
                <el-button
                  type="success"
                  size="small"
                  @click="handleCompleteDocument(scope.row)"
                >
                  完成
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination" style="margin-top: 15px; text-align: right">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="filteredDocList.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
//import { log } from "console";

// 添加表格引用
const tableRef = ref(null);

// 页面状态
const currentPage = ref(1);
const pageSize = ref(10);
const searchKeyword = ref("");
const selectedOrg = ref("");
const loading = ref(false); // 加载状态

// 添加防抖计时器
let resizeTimer = null;

// 公文列表数据
const docList = ref([]);
// 组织列表数据
const orgList = ref([]);

// 过滤后的公文列表（计算属性）
const filteredDocList = computed(() => {
  let result = [...docList.value];

  // 只显示未完成的公文
  result = result.filter((doc) => !doc.isCompleted);

  // 按公文名称搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter((doc) => doc.title.toLowerCase().includes(keyword));
  }

  // 按承办单位筛选 - 修复类型不匹配问题
  if (selectedOrg.value) {
    console.log(
      "筛选组织ID:",
      selectedOrg.value,
      "类型:",
      typeof selectedOrg.value
    );
    console.log(
      "文档数据示例:",
      docList.value[0]?.承办单位_id,
      "类型:",
      typeof docList.value[0]?.承办单位_id
    );

    // 使用 Number() 进行类型转换，确保类型匹配
    result = result.filter(
      (doc) => doc && Number(doc.承办单位_id) === Number(selectedOrg.value)
    );
  }

  return result;
});

// 分页后的公文列表（计算属性）
const pagedDocList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredDocList.value.slice(start, end);
});

// 加载公文列表
const loadDocuments = async () => {
  try {
    loading.value = true;
    const data = await window.electronAPI.getDocuments();
    docList.value = data;
  } catch (error) {
    console.error("加载公文列表失败:", error);
    ElMessage.error("加载公文列表失败");
  } finally {
    loading.value = false;
  }
};

// 加载组织列表
const loadOrganizations = async () => {
  try {
    const data = await window.electronAPI.getOrganizations();
    // 只显示启用状态organization
    orgList.value = data.filter((org) => org.status === "active");
  } catch (error) {
    console.error("加载组织列表失败:", error);
    ElMessage.error("加载组织列表失败");
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 搜索时重置到第一页
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = "";
  selectedOrg.value = "";
  currentPage.value = 1;
};

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
};

// 当前页变化
const handleCurrentChange = (current) => {
  currentPage.value = current;
};

// 处理完成公文
const handleCompleteDocument = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要将公文「${row.title}」标记为完成状态吗？`,
      "确认完成",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      }
    );

    // 1. 先更新isCompleted字段为true
    await window.electronAPI.updateDocument(row.id, {
      isCompleted: true,
    });

    // 2. 生成当前时间作为办理时间
    const currentTime = new Date()
      .toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\//g, "-");

    // 3. 然后更新processingTime为当前时间
    await window.electronAPI.updateDocument(row.id, {
      processingTime: currentTime,
    });

    ElMessage.success("公文标记为完成成功");
    await loadDocuments(); // 重新加载公文列表
  } catch (error) {
    if (error !== "cancel") {
      console.error("标记公文为完成失败的详细错误:", error);
      ElMessage.error(`标记公文为完成失败: ${error.message || String(error)}`);
    }
  }
};

// 添加窗口大小变化处理函数
const handleWindowResize = () => {
  // 防抖处理，避免频繁触发
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  resizeTimer = setTimeout(() => {
    if (tableRef.value) {
      // 调用doLayout方法重新计算表格布局
      tableRef.value.doLayout();
    }
  }, 100);
};

// 组件挂载时加载数据
onMounted(async () => {
  await loadDocuments();
  await loadOrganizations();
  // 添加窗口大小变化监听
  window.addEventListener("resize", handleWindowResize);
});

// 页面卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener("resize", handleWindowResize);
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
});

const getReminderText = (deadline) => {
  if (!deadline) return "无时限";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "已逾期";
  if (diffDays === 0) return "今日到期";
  if (diffDays === 1) return "明日到期";
  if (diffDays <= 3) return `${diffDays}天后到期`;
  return "正常待办";
};

const getReminderType = (deadline) => {
  if (!deadline) return "info";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "danger";
  if (diffDays === 0) return "warning";
  if (diffDays === 1) return "warning";
  if (diffDays <= 3) return "primary";
  return "success";
};
</script>

<style scoped>
.doc-config-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.el-header {
  padding: 0;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.header-content h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.el-main {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background-color: #f5f5f5;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background-color: #f5f5f5;
}

.search-card {
  background-color: #fff;
  padding: 15px;
}

.table-card {
  background-color: #fff;
  overflow: hidden;
}

/* 覆盖el-scrollbar__view的默认样式 */
.table-card :deep(.el-scrollbar__view) {
  display: block !important;
  vertical-align: baseline !important; /* 重置为默认值 */
  width: 100% !important; /* 确保宽度充满父容器 */
}

/* 确保滚动条容器也正确对齐 */
.table-card :deep(.el-scrollbar__wrap) {
  margin-right: 0 !important; /* 移除默认的右边距 */
  margin-bottom: 0 !important; /* 移除默认的下边距 */
  width: 100% !important;
}

/* 确保表格主体也正确对齐 */
.table-card :deep(.el-table) {
  margin: 0 !important;
  width: 100% !important;
}

.pagination {
  margin-top: 15px;
  text-align: right;
}

/* 适配小屏幕 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .main-content {
    padding: 10px;
  }
}

/* 关键样式：强制固定表格行高 */
:deep(.el-table) {
  .el-table__row {
    height: 40px !important;
    min-height: 40px !important;
    max-height: 40px !important;
    overflow: hidden;
  }

  .el-table__row .el-table__cell .cell {
    height: 40px !important;
    line-height: 40px !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
    align-items: center;
  }
}

/* 确保表格滚动容器也不会影响行高 */
:deep(.el-table .el-table__body-wrapper) {
  overflow-y: auto !important;
}

/* 省略号文本样式 */
.ellipsis-cell {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: help;
  width: 100%;
  display: inline-block;
}

/* tooltip样式优化 */
:deep(.el-tooltip__popper) {
  max-width: 400px;
  word-wrap: break-word;
  white-space: normal;
}
</style>
