<template>
  <el-container class="emp-config-container">
    <!-- 页面标题栏 -->
    <el-header class="page-header">
      <div class="header-content">
        <h1>员工管理</h1>
        <el-button type="primary" icon="Plus" @click="handleAddEmp">
          新增员工
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
              placeholder="搜索员工姓名"
              prefix-icon="Search"
              @keyup.enter="handleSearch"
            />
          </el-col>
          <el-col :span="8">
            <el-select v-model="selectedOrg" placeholder="筛选组织" clearable>
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

      <!-- 员工列表表格 -->
      <el-card class="table-card" style="margin-top: 20px">
        <template v-if="loading">
          <el-empty description="数据加载中..." style="padding: 50px 0" />
        </template>
        <template v-else>
          <el-table
            ref="tableRef"
            :data="pagedEmpList"
            border
            style="width: 100%"
            :row-key="(row) => row.id"
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="phone" label="电话号码" width="150" />
            <el-table-column prop="enableDate" label="启用日期" width="120" />
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
              prop="organizationName"
              label="所属组织"
              width="150"
            />
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
                  @click="handleEditEmp(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="handleDeleteEmp(scope.row)"
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
              :total="filteredEmpList.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>
      </el-card>
    </el-main>
  </el-container>

  <!-- 新增/编辑员工弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增员工' : '编辑员工'"
    width="500px"
    @close="resetDialogForm"
  >
    <el-form
      :model="empForm"
      :rules="empRules"
      ref="empFormRef"
      label-width="100px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="empForm.name" placeholder="请输入员工姓名" />
      </el-form-item>
      <el-form-item label="电话号码" prop="phone">
        <el-input v-model="empForm.phone" placeholder="请输入电话号码" />
      </el-form-item>
      <el-form-item label="启用日期" prop="enableDate">
        <el-date-picker
          v-model="empForm.enableDate"
          type="date"
          placeholder="选择启用日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="所属组织" prop="organizationId">
        <el-select
          v-model="empForm.organizationId"
          placeholder="请选择所属组织"
        >
          <el-option
            v-for="item in orgList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="empForm.status">
          <el-radio value="active">启用</el-radio>
          <el-radio value="inactive">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSaveEmp"> 保存 </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { User, Plus, Edit, Delete, Tools } from "@element-plus/icons-vue";

// 添加表格引用
const tableRef = ref(null);

// 页面状态
const currentPage = ref(1);
const pageSize = ref(10);
const searchKeyword = ref("");
const selectedOrg = ref("");
const dialogVisible = ref(false);
const dialogType = ref("add"); // 'add' 或 'edit'
const currentEmp = ref(null);
const loading = ref(false); // 加载状态
const empFormRef = ref();

// 添加防抖计时器
let resizeTimer = null;

// 员工列表数据
const empList = ref([]);
// 组织列表数据
const orgList = ref([]);

// 员工表单数据
const empForm = reactive({
  id: "",
  name: "",
  phone: "",
  enableDate: new Date().toISOString().split("T")[0], // 默认当前日期
  status: "active", // 默认启用
  organizationId: "",
});

// 表单验证规则
const empRules = {
  name: [
    { required: true, message: "请输入员工姓名", trigger: "blur" },
    {
      min: 2,
      max: 20,
      message: "姓名长度在 2 到 20 个字符之间",
      trigger: "blur",
    },
  ],
  phone: [
    { required: true, message: "请输入电话号码", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入有效的手机号码",
      trigger: "blur",
    },
  ],
  enableDate: [
    { required: true, message: "请选择启用日期", trigger: "change" },
  ],
  organizationId: [
    { required: true, message: "请选择所属组织", trigger: "change" },
  ],
};

// 过滤后的员工列表（计算属性）
const filteredEmpList = computed(() => {
  let result = [...empList.value];

  // 按姓名搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter((emp) => emp.name.toLowerCase().includes(keyword));
  }

  // 按组织筛选
  if (selectedOrg.value) {
    result = result.filter((emp) => emp.organizationId === selectedOrg.value);
  }

  return result;
});

// 分页后的员工列表（计算属性）
const pagedEmpList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredEmpList.value.slice(start, end);
});

// 加载员工列表
const loadEmployees = async () => {
  try {
    loading.value = true;
    const data = await window.electronAPI.getEmployees();
    empList.value = data;
  } catch (error) {
    console.error("加载员工列表失败:", error);
    ElMessage.error("加载员工列表失败");
  } finally {
    loading.value = false;
  }
};

// 加载组织列表
const loadOrganizations = async () => {
  try {
    const data = await window.electronAPI.getOrganizations();
    // 只显示启用状态的组织
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

// 处理新增员工
const handleAddEmp = () => {
  dialogType.value = "add";
  dialogVisible.value = true;
};

// 处理编辑员工
const handleEditEmp = (row) => {
  dialogType.value = "edit";
  currentEmp.value = { ...row };
  // 填充表单
  empForm.id = row.id;
  empForm.name = row.name;
  empForm.phone = row.phone;
  empForm.enableDate = row.enableDate;
  empForm.organizationId = row.organizationId;
  empForm.status = row.status;
  dialogVisible.value = true;
};

// 处理删除员工
const handleDeleteEmp = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除员工「${row.name}」吗？删除后数据将不可恢复。`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await window.electronAPI.deleteEmployee(row.id);
    ElMessage.success("员工删除成功");
    await loadEmployees(); // 重新加载员工列表
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除员工失败:", error);
      ElMessage.error("删除员工失败");
    }
  }
};

// 保存员工（新增/编辑）
const handleSaveEmp = async () => {
  // 表单验证
  if (!empFormRef.value) {
    ElMessage.error("表单引用不存在");
    return;
  }

  try {
    await empFormRef.value.validate();

    if (dialogType.value === "add") {
      // 新增逻辑
      const empData = {
        name: empForm.name,
        phone: empForm.phone,
        enableDate: empForm.enableDate,
        status: empForm.status,
        organizationId: empForm.organizationId,
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

      await window.electronAPI.addEmployee(empData);
      ElMessage.success("员工新增成功");
    } else {
      // 编辑逻辑
      const empData = {
        name: empForm.name,
        phone: empForm.phone,
        enableDate: empForm.enableDate,
        status: empForm.status,
        organizationId: empForm.organizationId,
      };

      await window.electronAPI.updateEmployee(empForm.id, empData);
      ElMessage.success("员工编辑成功");
    }

    await loadEmployees(); // 重新加载员工列表
    dialogVisible.value = false;
  } catch (error) {
    console.error("保存员工失败:", error);
    ElMessage.error(
      dialogType.value === "add" ? "新增员工失败" : "编辑员工失败"
    );
  }
};

// 重置弹窗表单
const resetDialogForm = () => {
  empForm.id = "";
  empForm.name = "";
  empForm.phone = "";
  empForm.enableDate = new Date().toISOString().split("T")[0];
  empForm.organizationId = "";
  empForm.status = "active";
  if (empFormRef.value) {
    empFormRef.value.resetFields();
  }
};

// 组件挂载时加载数据
onMounted(async () => {
  await loadEmployees();
  await loadOrganizations();
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

// 页面卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener("resize", handleWindowResize);
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
});
</script>

<style scoped>
.emp-config-container {
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
</style>
