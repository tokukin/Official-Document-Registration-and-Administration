<template>
  <el-container class="org-config-container">
    <!-- 页面标题栏 -->
    <el-header class="page-header">
      <div class="header-content">
        <h1>组织配置管理</h1>
        <el-button type="primary" icon="Plus" @click="handleAddOrg">
          新增组织
        </el-button>
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
              placeholder="搜索组织名称"
              prefix-icon="Search"
              @keyup.enter="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
            <el-button plain @click="resetSearch" style="margin-left: 10px">
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 组织列表表格 -->
      <el-card class="table-card" style="margin-top: 20px">
        <template v-if="loading">
          <el-empty description="数据加载中..." style="padding: 50px 0" />
        </template>
        <template v-else>
          <el-table
            ref="tableRef"
            :data="filteredOrgList"
            border
            style="width: 100%"
            :row-key="(row) => row.id"
          >
            <!-- 统一所有列的对齐方式为居中 -->
            <el-table-column prop="id" label="ID" width="50" align="center" />
            <el-table-column
              prop="name"
              label="组织名称"
              width="200"
              align="center"
            >
              <!-- 对于文本内容，使用自定义模板实现内容左对齐 -->
              <template #default="scope">
                <div style="text-align: left; padding-left: 10px">
                  {{ scope.row.name }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="parentName"
              label="上级组织"
              width="200"
              align="center"
            >
              <!-- 对于文本内容，使用自定义模板实现内容左对齐 -->
              <template #default="scope">
                <div style="text-align: left; padding-left: 10px">
                  {{ scope.row.parentName || "-" }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              width="100"
              align="center"
            >
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === 'active' ? 'success' : 'danger'"
                >
                  {{ scope.row.status === "active" ? "启用" : "禁用" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              width="180"
              align="center"
            />
            <el-table-column label="操作" width="200" align="center">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleEditOrg(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDeleteOrg(scope.row)"
                >
                  删除
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
              :total="filteredOrgList.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>
      </el-card>
    </el-main>
  </el-container>

  <!-- 新增/编辑组织弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增组织' : '编辑组织'"
    :width="dialogWidth"
    @close="resetDialogForm"
  >
    <el-form
      :model="orgForm"
      :rules="orgRules"
      ref="orgFormRef"
      label-width="120px"
    >
      <el-form-item label="组织名称" prop="name">
        <el-input v-model="orgForm.name" placeholder="请输入组织名称" />
      </el-form-item>
      <el-form-item label="上级组织" prop="parentId">
        <el-select
          v-model="orgForm.parentId"
          placeholder="请选择上级组织（可选）"
        >
          <el-option
            v-for="item in orgList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <!-- 已删除：组织描述字段 -->
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="orgForm.status">
          <el-radio value="active">启用</el-radio>
          <el-radio value="inactive">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSaveOrg"> 保存 </el-button>
    </template>
  </el-dialog>

  <!-- 删除确认弹窗 -->
  <el-dialog v-model="deleteDialogVisible" title="确认删除" width="30%">
    <p>确定要删除组织「{{ currentOrg.name }}」吗？删除后数据将不可恢复。</p>
    <template #footer>
      <el-button @click="deleteDialogVisible = false">取消</el-button>
      <el-button type="danger" @click="confirmDelete"> 确认删除 </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 添加表格引用
const tableRef = ref(null);

// 页面状态
const currentPage = ref(1);
const pageSize = ref(10);
const searchKeyword = ref("");
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const dialogType = ref("add"); // 'add' 或 'edit'
const dialogWidth = ref("500px");
const currentOrg = ref(null);
const loading = ref(false); // 加载状态
const orgFormRef = ref();

// 组织表单数据
const orgForm = reactive({
  id: "",
  name: "",
  parentId: "",
  status: "active", // 默认启用
  // 已删除：description字段
});

// 表单验证规则
const orgRules = reactive({
  name: [
    { required: true, message: "请输入组织名称", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "组织名称长度在 2-50 个字符之间",
      trigger: "blur",
    },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
});

// 组织列表数据（从数据库获取）
const orgList = ref([]);

// 筛选后的组织列表（带搜索功能）
const filteredOrgList = computed(() => {
  if (!searchKeyword.value) return orgList.value;
  const keyword = searchKeyword.value.toLowerCase();
  return orgList.value.filter((org) =>
    org.name.toLowerCase().includes(keyword)
  );
});

// 从数据库加载组织列表
const loadOrganizations = async () => {
  try {
    loading.value = true;
    const organizations = await window.electronAPI.getOrganizations();
    orgList.value = organizations;
  } catch (error) {
    console.error("获取组织列表失败:", error);
    ElMessage.error("获取组织列表失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 生命周期：页面加载时初始化
onMounted(() => {
  loadOrganizations();
  // 添加窗口大小变化监听
  window.addEventListener("resize", handleWindowResize);
});

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

// 添加防抖计时器
let resizeTimer = null;

// 页面卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener("resize", handleWindowResize);
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
});

// 搜索功能
const handleSearch = () => {
  currentPage.value = 1; // 搜索后重置到第一页
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = "";
  currentPage.value = 1;
};

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 新增组织
const handleAddOrg = () => {
  dialogType.value = "add";
  resetDialogForm();
  dialogVisible.value = true;
};

// 编辑组织
const handleEditOrg = (row) => {
  dialogType.value = "edit";
  currentOrg.value = { ...row };
  // 填充表单
  orgForm.id = row.id;
  orgForm.name = row.name;
  orgForm.parentId = row.parentId;
  // 已删除：orgForm.description = row.description;
  orgForm.status = row.status;
  dialogVisible.value = true;
};

// 删除组织（打开确认弹窗）
const handleDeleteOrg = (row) => {
  currentOrg.value = { ...row };
  deleteDialogVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  try {
    await window.electronAPI.deleteOrganization(currentOrg.value.id);
    await loadOrganizations(); // 重新加载组织列表
    ElMessage.success("组织删除成功");
  } catch (error) {
    console.error("删除组织失败:", error);
    ElMessage.error("删除组织失败，请重试");
  } finally {
    deleteDialogVisible.value = false;
  }
};

// 保存组织（新增/编辑）
const handleSaveOrg = async () => {
  // 表单验证
  if (!orgFormRef.value) {
    ElMessage.error("表单引用不存在");
    return;
  }

  try {
    await orgFormRef.value.validate();

    if (dialogType.value === "add") {
      // 新增逻辑
      const orgData = {
        name: orgForm.name,
        parentId: orgForm.parentId,
        status: orgForm.status,
        // 已删除：description字段
        createTime: new Date()
          .toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
          .replace(/\//g, "-"),
      };

      await window.electronAPI.addOrganization(orgData);
      ElMessage.success("组织新增成功");
    } else {
      // 编辑逻辑
      const orgData = {
        name: orgForm.name,
        parentId: orgForm.parentId,
        status: orgForm.status,
        // 已删除：description字段
      };

      await window.electronAPI.updateOrganization(orgForm.id, orgData);
      ElMessage.success("组织编辑成功");
    }

    await loadOrganizations(); // 重新加载组织列表
    dialogVisible.value = false;
  } catch (error) {
    console.error("保存组织失败:", error);
    ElMessage.error(
      dialogType.value === "add" ? "新增组织失败" : "编辑组织失败"
    );
  }
};

// 重置弹窗表单
const resetDialogForm = () => {
  orgForm.id = "";
  orgForm.name = "";
  orgForm.parentId = "";
  orgForm.status = "active";
  // 已删除：orgForm.description = "";
  if (orgFormRef.value) {
    orgFormRef.value.resetFields();
  }
};
</script>

<style scoped>
.org-config-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0;
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
  overflow: hidden; /* 添加这一行防止子元素溢出 */
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

/* 适配小屏幕 */
@media (max-width: 768px) {
  .dialog-width {
    width: 90% !important;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .main-content {
    padding: 10px;
  }
}
</style>
