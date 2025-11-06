<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-button type="primary">主要按钮（Element Plus 样式）</el-button>
        <el-button type="primary">主要按钮（Element Plus 样式）</el-button>
      </el-header>
      <el-main>
        <table class="demo-border">
          <el-table
            :data="tableData"
            style="width: 100%"
            :row-class-name="tableRowClassName"
          >
            <el-table-column prop="dep" label="组织" />
            <el-table-column prop="add_time" label="添加时间" />
            <el-table-column prop="expiry_time" label="失效时间" />
          </el-table>
        </table>
      </el-main>
      <el-footer>
        <div class="button-row">
          <el-button type="primary">增加</el-button>
          <el-button type="danger">删除</el-button>
        </div>
      </el-footer>
    </el-container>
  </div>

  <!-- 使用 Element Plus 组件（自带样式，无需手动写 CSS） -->
</template>

<script lang="ts" setup>
// import { ref } from "vue"; // 注释掉未使用的导入

// const items = ref([{ dep: "IT" }, { dep: "HR" }]); // 注释掉未使用的变量

interface User {
  dep: string;
  add_time: string;
  expiry_time: string;
  address: string;
}

const tableRowClassName = ({
  // row, // 注释掉未使用的参数
  rowIndex,
}: {
  row: User;
  rowIndex: number;
}) => {
  if (rowIndex % 2 === 0) {
    return "warning-row";
  } else if (rowIndex % 2 === 1) {
    return "success-row";
  }
  return "";
};

const tableData: User[] = [
  {
    dep: "秘书一科",
    add_time: "2025-11-04",
    expiry_time: "2025-11-04",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    dep: "秘书二科",
    add_time: "2025-11-04",
    expiry_time: "2025-11-04",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    dep: "秘书三科",
    add_time: "2025-11-04",
    expiry_time: "2025-11-04",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    dep: "秘书四科",
    add_time: "2025-11-04",
    expiry_time: "2025-11-04",
    address: "No. 189, Grove St, Los Angeles",
  },
];
</script>
<style scoped>
/* 让 el-container 占满父元素（#app）的高度和宽度 */
.full-page-container {
  height: 100%;
  width: 100%;
}

.demo-border {
  width: 100%;
  height: 100%;
  border: 1px solid var(--el-border-color);
}
.demo-border .text {
  width: 15%;
}
.demo-border .line {
  width: 70%;
}
.demo-border .line div {
  width: 100%;
  height: 0;
  border-top: 1px solid var(--el-border-color);
}
.demo-border .line .dashed {
  border-top: 2px dashed var(--el-border-color);
}

.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>
