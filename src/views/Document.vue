<template>
  <el-container class="doc-config-container">
    <!-- 页面标题栏 -->
    <el-header class="page-header">
      <div class="header-content">
        <h1>公文管理</h1>
        <el-button type="primary" icon="Plus" @click="handleAddDocument">
          新增公文
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
            <!-- <el-table-column prop="id" label="ID" width="80" align="center" /> -->
            <el-table-column prop="title" label="公文名称" width="200">
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
                  :content="scope.row.documentNumber"
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
              prop="isReturned"
              label="是否退回"
              width="100"
              align="center"
            >
              <template #default="scope">
                <el-tag :type="scope.row.isReturned ? 'danger' : 'success'">
                  {{ scope.row.isReturned ? "是" : "否" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="returnReason" label="退回原因" width="150">
              <template #default="scope">
                <el-tooltip
                  effect="dark"
                  :content="scope.row.returnReason"
                  placement="top"
                  :disabled="false"
                >
                  <span class="ellipsis-cell">{{
                    scope.row.returnReason
                  }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="deadline"
              label="办理时限"
              width="120"
              align="center"
            />
            <el-table-column prop="承办单位" label="承办单位" width="150">
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
            <el-table-column prop="协办信息" label="协办信息" width="200">
              <template #default="scope">
                <el-tooltip
                  effect="dark"
                  :content="formatAssistInfo(scope.row.协办信息)"
                  placement="top"
                  :disabled="false"
                >
                  <span class="ellipsis-cell">
                    <div
                      v-if="scope.row.协办信息 && scope.row.协办信息.length > 0"
                    >
                      <div
                        v-for="(item, index) in scope.row.协办信息"
                        :key="index"
                      >
                        {{ item.协办单位 }}-{{ item.协办人员 }}
                      </div>
                    </div>
                    <span v-else>无</span>
                  </span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="isCompleted"
              label="是否完成"
              width="100"
              align="center"
            >
              <template #default="scope">
                <el-tag :type="scope.row.isCompleted ? 'success' : 'warning'">
                  {{ scope.row.isCompleted ? "是" : "否" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="processingTime"
              label="办理时间"
              width="180"
              align="center"
            >
              <template #default="scope">
                <el-tooltip
                  v-if="scope.row.processingTime"
                  class="item"
                  effect="dark"
                  :content="scope.row.processingTime"
                  placement="top"
                >
                  <span class="ellipsis-text">
                    {{ scope.row.processingTime }}
                  </span>
                </el-tooltip>
                <span v-else>未办理</span>
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
                  @click="handleEditDocument(scope.row)"
                  v-if="!scope.row.isCompleted"
                >
                  编辑
                </el-button>

                <el-button
                  type="success"
                  size="small"
                  @click="handleCompleteDocument(scope.row)"
                  v-if="!scope.row.isCompleted"
                >
                  完成
                </el-button>

                <el-button
                  size="small"
                  type="danger"
                  @click="handleDeleteDocument(scope.row)"
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

  <!-- 新增/编辑公文弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增公文' : '编辑公文'"
    width="700px"
    @close="resetDialogForm"
  >
    <el-form
      :model="docForm"
      :rules="docRules"
      ref="docFormRef"
      label-width="120px"
    >
      <el-form-item label="公文名称" prop="title">
        <el-input
          v-model="docForm.title"
          placeholder="请输入公文名称"
          :disabled="dialogType === 'edit'"
        />
      </el-form-item>
      <el-form-item label="公文编号" prop="documentNumber">
        <el-input
          v-model="docForm.documentNumber"
          placeholder="请输入公文编号"
          :disabled="dialogType === 'edit'"
        />
      </el-form-item>
      <el-form-item label="文种" prop="documentType">
        <el-input
          v-model="docForm.documentType"
          placeholder="请输入文种"
          :disabled="dialogType === 'edit'"
        />
      </el-form-item>
      <el-form-item label="来文单位" prop="senderOrganization">
        <el-input
          v-model="docForm.senderOrganization"
          placeholder="请输入来文单位"
          :disabled="dialogType === 'edit'"
        />
      </el-form-item>
      <el-form-item label="收文日期" prop="receiveDate">
        <el-date-picker
          v-model="docForm.receiveDate"
          type="date"
          placeholder="选择收文日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled="dialogType === 'edit'"
        />
      </el-form-item>
      <el-form-item label="是否退回" prop="isReturned">
        <el-switch
          v-model="docForm.isReturned"
          :disabled="dialogType === 'edit'"
        />
      </el-form-item>
      <el-form-item
        label="退回原因"
        prop="returnReason"
        v-if="docForm.isReturned"
        :disabled="dialogType === 'edit'"
      >
        <el-input
          v-model="docForm.returnReason"
          placeholder="请输入退回原因"
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="办理时限" prop="deadline">
        <el-date-picker
          v-model="docForm.deadline"
          type="date"
          placeholder="选择办理时限"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled="dialogType === 'edit'"
        />
      </el-form-item>
      <el-form-item label="承办单位" prop="承办单位_id">
        <el-select
          v-model="docForm.承办单位_id"
          placeholder="请选择承办单位"
          @change="onOrganizationChange"
        >
          <el-option
            v-for="item in orgList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="承办人员" prop="承办人员_id">
        <el-select v-model="docForm.承办人员_id" placeholder="请选择承办人员">
          <el-option
            v-for="item in filteredEmployees"
            :key="item.id"
            :label="item.name + '(' + item.phone + ')'"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <!-- 修改协办信息列表，确保每个项目显示在新一行 -->
      <el-form-item label="协办信息">
        <!-- 为每个协办信息项添加明确的块级显示样式 -->
        <div
          v-for="(item, index) in docForm.协办信息"
          :key="index"
          style="margin-bottom: 10px; display: block; clear: both; width: 90%"
        >
          <el-row :gutter="10">
            <el-col :span="11">
              <el-select
                v-model="item.assistOrganizationId"
                placeholder="选择协办单位"
                @change="() => onAssistOrgChange(index)"
              >
                <el-option
                  v-for="org in orgList"
                  :key="org.id"
                  :label="org.name"
                  :value="org.id"
                />
              </el-select>
            </el-col>
            <el-col :span="11">
              <el-select
                v-model="item.assistEmployeeId"
                placeholder="选择协办人员"
              >
                <el-option
                  v-for="emp in getAssistEmployees(index)"
                  :key="emp.id"
                  :label="emp.name + '(' + emp.phone + ')'"
                  :value="emp.id"
                />
              </el-select>
            </el-col>
            <el-col :span="2">
              <el-button type="danger" @click="removeAssist(index)"
                >删除</el-button
              >
            </el-col>
          </el-row>
        </div>
        <el-button type="primary" plain @click="addAssist"
          >添加协办单位</el-button
        >
      </el-form-item>
      <el-form-item
        label="是否办理完成"
        prop="isCompleted"
        :disabled="dialogType === 'edit'"
      >
        <el-switch
          v-model="docForm.isCompleted"
          :disabled="dialogType === 'edit'"
        />
      </el-form-item>
      <el-form-item label="办理时间" prop="processingTime">
        <el-date-picker
          v-model="docForm.processingTime"
          type="datetime"
          placeholder="选择办理时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :disabled="dialogType === 'edit'"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSaveDocument"> 保存 </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox, ElTooltip } from "element-plus";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";

// 添加表格引用
const tableRef = ref(null);

// 页面状态
const currentPage = ref(1);
const pageSize = ref(10);
const searchKeyword = ref("");
const selectedOrg = ref("");
const dialogVisible = ref(false);
const dialogType = ref("add"); // 'add' 或 'edit'
const currentDoc = ref(null);
const loading = ref(false); // 加载状态
const docFormRef = ref();

// 添加防抖计时器
let resizeTimer = null;

// 公文列表数据
const docList = ref([]);
// 组织列表数据
const orgList = ref([]);
// 员工列表数据
const empList = ref([]);

// 公文表单数据
const docForm = reactive({
  id: "",
  title: "",
  documentNumber: "",
  documentType: "",
  senderOrganization: "",
  receiveDate: new Date().toISOString().split("T")[0], // 默认当前日期
  isReturned: false,
  returnReason: "",
  deadline: "",
  承办单位_id: "",
  承办人员_id: "",
  协办信息: [],
  isCompleted: false,
  processingTime: "",
});

// 表单验证规则
const docRules = reactive({
  title: [
    { required: true, message: "请输入公文名称", trigger: "blur" },
    {
      min: 2,
      max: 100,
      message: "公文名称长度在 2-100 个字符之间",
      trigger: "blur",
    },
  ],
  documentNumber: [
    { required: true, message: "请输入公文编号", trigger: "blur" },
  ],
  documentType: [{ required: true, message: "请输入文种", trigger: "blur" }],
  senderOrganization: [
    { required: true, message: "请输入来文单位", trigger: "blur" },
  ],
  receiveDate: [
    { required: true, message: "请选择收文日期", trigger: "change" },
  ],
  承办单位_id: [
    { required: true, message: "请选择承办单位", trigger: "change" },
  ],
  承办人员_id: [
    { required: true, message: "请选择承办人员", trigger: "change" },
  ],
});

// 根据承办单位过滤的员工列表
const filteredEmployees = computed(() => {
  if (!docForm.承办单位_id) {
    return empList.value;
  }
  return empList.value.filter(
    (emp) => emp.organizationId === docForm.承办单位_id
  );
});

// 获取指定协办项的员工列表
const getAssistEmployees = (index) => {
  const assistOrgId = docForm.协办信息[index]?.assistOrganizationId;
  if (!assistOrgId) {
    return empList.value;
  }
  return empList.value.filter((emp) => emp.organizationId === assistOrgId);
};

// 过滤后的公文列表（计算属性）
const filteredDocList = computed(() => {
  let result = [...docList.value];

  // 按公文名称搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter((doc) => doc.title.toLowerCase().includes(keyword));
  }

  // 按承办单位筛选 - 修复类型不匹配问题
  if (selectedOrg.value) {
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

// 加载员工列表
const loadEmployees = async () => {
  try {
    const data = await window.electronAPI.getEmployees();
    // 只显示启用状态的员工
    empList.value = data.filter((emp) => emp.status === "active");
  } catch (error) {
    console.error("加载员工列表失败:", error);
    ElMessage.error("加载员工列表失败");
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

// 处理新增公文
const handleAddDocument = () => {
  dialogType.value = "add";
  dialogVisible.value = true;
};

// 处理编辑公文
const handleEditDocument = (row) => {
  dialogType.value = "edit";
  currentDoc.value = { ...row };
  // 填充表单
  docForm.id = row.id;
  docForm.title = row.title;
  docForm.documentNumber = row.documentNumber;
  docForm.documentType = row.documentType;
  docForm.senderOrganization = row.senderOrganization;
  docForm.receiveDate = row.receiveDate;
  docForm.isReturned = row.isReturned;
  docForm.returnReason = row.returnReason;
  docForm.deadline = row.deadline;
  docForm.承办单位_id = row.承办单位_id;
  docForm.承办人员_id = row.承办人员_id;
  docForm.isCompleted = row.isCompleted;
  docForm.processingTime = row.processingTime;
  // 这里需要额外获取协办信息的完整数据
  dialogVisible.value = true;
};

// 处理删除公文
const handleDeleteDocument = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除公文「${row.title}」吗？删除后数据将不可恢复。`,
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await window.electronAPI.deleteDocument(row.id);
    ElMessage.success("公文删除成功");
    await loadDocuments(); // 重新加载公文列表
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除公文失败:", error);
      ElMessage.error("删除公文失败");
    }
  }
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

    //console.log(`开始标记公文ID: ${row.id} 为完成状态`);

    // 1. 先更新isCompleted字段为true
    //console.log(`第一步：更新isCompleted字段为true，公文ID: ${row.id}`);
    const updateCompletedResult = await window.electronAPI.updateDocument(
      row.id,
      {
        isCompleted: true,
      }
    );
    //console.log(`更新isCompleted结果:`, updateCompletedResult);

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
    console.log(`生成的办理时间: ${currentTime}`);

    // 3. 然后更新processingTime为当前时间
    console.log(
      `第二步：更新processingTime字段为${currentTime}，公文ID: ${row.id}`
    );
    const updateTimeResult = await window.electronAPI.updateDocument(row.id, {
      processingTime: currentTime,
    });
    console.log(`更新processingTime结果:`, updateTimeResult);

    ElMessage.success("公文标记为完成成功");
    console.log(`重新加载公文列表`);
    await loadDocuments(); // 重新加载公文列表
  } catch (error) {
    if (error !== "cancel") {
      console.error("标记公文为完成失败的详细错误:", error);
      ElMessage.error(`标记公文为完成失败: ${error.message || String(error)}`);
    }
  }
};

// 保存公文（新增/编辑）
async function handleSaveDocument() {
  if (!docFormRef.value) {
    ElMessage.error("表单引用不存在");
    return;
  }

  try {
    await docFormRef.value.validate();

    const docData = {
      title: docForm.title,
      documentNumber: docForm.documentNumber,
      documentType: docForm.documentType,
      senderOrganization: docForm.senderOrganization,
      receiveDate: docForm.receiveDate,
      isReturned: docForm.isReturned,
      returnReason: docForm.returnReason,
      deadline: docForm.deadline,
      processingTime: docForm.processingTime,
      承办单位_id: docForm.承办单位_id,
      承办人员_id: docForm.承办人员_id,
      协办信息: docForm.协办信息.filter(
        (item) => item.assistOrganizationId && item.assistEmployeeId
      ),
      isCompleted: docForm.isCompleted,
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

    // 创建一个可序列化的干净对象副本
    const serializableDocData = JSON.parse(JSON.stringify(docData));

    if (dialogType.value === "add") {
      // 新增逻辑
      await window.electronAPI.addDocument(serializableDocData);
      ElMessage.success("公文新增成功");
    } else {
      // 编辑逻辑
      await window.electronAPI.updateDocument(docForm.id, serializableDocData);
      ElMessage.success("公文编辑成功");
    }

    await loadDocuments(); // 重新加载公文列表
    dialogVisible.value = false;
  } catch (error) {
    console.error("保存公文失败:", error);
    ElMessage.error(
      dialogType.value === "add" ? "新增公文失败" : "编辑公文失败"
    );
  }
}

// 重置弹窗表单
const resetDialogForm = () => {
  docForm.id = "";
  docForm.title = "";
  docForm.documentNumber = "";
  docForm.documentType = "";
  docForm.senderOrganization = "";
  docForm.receiveDate = new Date().toISOString().split("T")[0];
  docForm.isReturned = false;
  docForm.returnReason = "";
  docForm.deadline = "";
  docForm.承办单位_id = "";
  docForm.承办人员_id = "";
  docForm.协办信息 = [];
  docForm.isCompleted = false;
  if (docFormRef.value) {
    docFormRef.value.resetFields();
  }
};

// 承办单位变更处理
const onOrganizationChange = () => {
  docForm.承办人员_id = "";
};

// 协办单位变更处理
const onAssistOrgChange = (index) => {
  docForm.协办信息[index].assistEmployeeId = "";
};

// 添加协办单位
const addAssist = () => {
  docForm.协办信息.push({
    assistOrganizationId: "",
    assistEmployeeId: "",
  });
};

// 移除协办单位
const removeAssist = (index) => {
  docForm.协办信息.splice(index, 1);
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
  await loadEmployees();
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

// 格式化协办信息为易读的字符串
const formatAssistInfo = (assistInfo) => {
  if (!assistInfo || !assistInfo.length) {
    return "无协办信息";
  }

  return assistInfo
    .map((item, index) => {
      return `协办${index + 1}: ${item.协办单位 || "无单位"}-${
        item.协办人员 || "无人员"
      }`;
    })
    .join("\n");
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

.search-card {
  background-color: #fff;
  padding: 15px;
}

.table-card {
  background-color: #fff;
  overflow: hidden;
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
