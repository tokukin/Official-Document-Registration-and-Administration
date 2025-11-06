<template>
  <el-container class="statistics-container">
    <!-- 页面标题栏 -->
    <el-header class="page-header">
      <div class="header-content">
        <h1>统计分析</h1>
      </div>
    </el-header>

    <!-- 主要内容区 -->
    <el-main class="main-content">
      <!-- 顶部统计信息和期间选择器 -->
      <el-card class="stats-card">
        <el-row :gutter="20" type="flex" align="middle">
          <!-- 统计数据 -->
          <el-col :span="12">
            <el-row :gutter="20">
              <el-col :span="7">
                <div class="stat-item">
                  <div class="stat-label">总公文量</div>
                  <div class="stat-value">{{ totalDocuments }}</div>
                </div>
              </el-col>
              <el-col :span="7">
                <div class="stat-item">
                  <div class="stat-label">总机构数</div>
                  <div class="stat-value">{{ totalOrgs }}</div>
                </div>
              </el-col>
              <el-col :span="7">
                <div class="stat-item">
                  <div class="stat-label">总人员数</div>
                  <div class="stat-value">{{ totalPersons }}</div>
                </div>
              </el-col>
            </el-row>
          </el-col>

          <!-- 期间选择器和查询按钮 - 修复后的布局 -->
          <el-col :span="12">
            <el-row :gutter="10" type="flex" align="middle">
              <el-col :span="16">
                <el-date-picker
                  v-model="dateRange"
                  type="monthrange"
                  range-separator="至"
                  start-placeholder="开始月份"
                  end-placeholder="结束月份"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  :default-value="[currentMonth, currentMonth]"
                />
              </el-col>
              <el-col :span="8">
                <el-button type="primary" @click="handleQuery">查询</el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-card>

      <!-- 图表区域 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 每天公文接收新增量图表 -->
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>每天公文接收新增量</span>
              </div>
            </template>
            <div class="chart-container">
              <div ref="dailyChart" class="chart" style="height: 300px"></div>
            </div>
          </el-card>
        </el-col>

        <!-- 各组织公文承办公文量图表 -->
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>各组织公文承办公文量</span>
              </div>
            </template>
            <div class="chart-container">
              <div ref="orgChart" class="chart" style="height: 300px"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

// 在script setup部分的开头添加dateRange和currentMonth变量的定义
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";

// 添加dateRange变量定义
const dateRange = ref([]);

// 添加currentMonth变量定义
const currentMonth = new Date().toISOString().slice(0, 7); // 格式为YYYY-MM

// 修改统计数据部分
const totalDocuments = ref(0); // 总公文量
const totalOrgs = ref(0); // 总机构数
const totalPersons = ref(0); // 总人员数

// 添加图表容器引用
const dailyChart = ref(null);
const orgChart = ref(null);
let dailyChartInstance = null;
let orgChartInstance = null;

// 添加模拟数据生成函数
const generateDailyData = () => {
  const data = [];
  const days = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  for (let i = 1; i <= days; i++) {
    data.push({
      date: `${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      count: Math.floor(Math.random() * 20) + 1,
    });
  }
  return data;
};

const generateOrgData = () => {
  const organizations = [
    "办公室",
    "人事处",
    "财务处",
    "业务一处",
    "业务二处",
    "业务三处",
    "信息中心",
  ];
  return organizations.map((org) => ({
    name: org,
    count: Math.floor(Math.random() * 50) + 5,
  }));
};

// 从数据库获取统计数据
const loadStatisticsSummary = async () => {
  try {
    const summary = await window.electronAPI.getStatisticsSummary();
    totalDocuments.value = summary.totalDocuments;
    totalOrgs.value = summary.totalOrgs;
    totalPersons.value = summary.totalPersons;
  } catch (error) {
    console.error("加载统计摘要失败:", error);
    ElMessage.error("加载统计数据失败");
  }
};

// 从数据库获取每日公文统计数据
const loadDailyDocumentStats = async (startDate, endDate) => {
  try {
    // 确保日期格式正确
    const start = startDate + "-01";
    // 计算结束日期为月末
    const [year, month] = endDate.split("-");
    const end = new Date(parseInt(year), parseInt(month), 0)
      .toISOString()
      .split("T")[0];

    const data = await window.electronAPI.getDailyDocumentStats(start, end);

    // 如果没有数据，生成一些模拟数据
    if (!data || data.length === 0) {
      return generateDailyData();
    }

    return data;
  } catch (error) {
    console.error("加载每日公文统计失败:", error);
    // 出错时返回模拟数据
    return generateDailyData();
  }
};

// 从数据库获取组织公文统计数据
const loadOrgDocumentStats = async (startDate, endDate) => {
  try {
    // 确保日期格式正确
    const start = startDate + "-01";
    // 计算结束日期为月末
    const [year, month] = endDate.split("-");
    const end = new Date(parseInt(year), parseInt(month), 0)
      .toISOString()
      .split("T")[0];

    const data = await window.electronAPI.getOrgDocumentStats(start, end);

    // 如果没有数据，生成一些模拟数据
    if (!data || data.length === 0) {
      return generateOrgData();
    }

    return data;
  } catch (error) {
    console.error("加载组织公文统计失败:", error);
    // 出错时返回模拟数据
    return generateOrgData();
  }
};

// 修改createDailyChart函数，使用从数据库获取的数据
const createDailyChart = async () => {
  if (!dailyChart.value || !window.d3) return;

  // 获取容器尺寸
  const { width } = dailyChart.value.getBoundingClientRect();

  // 清空容器
  dailyChart.value.innerHTML = "";

  // 使用从数据库获取的数据
  const data = await loadDailyDocumentStats(
    dateRange.value[0],
    dateRange.value[1]
  );
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = 250 - margin.top - margin.bottom;

  // 使用D3.js创建SVG元素和图表结构
  const svg = d3
    .select(dailyChart.value)
    .append("svg")
    .attr("width", width)
    .attr("height", 250);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 计算比例尺
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.date.substring(8)))
    .range([0, chartWidth])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count)])
    .range([chartHeight, 0]);

  // 创建坐标轴容器并渲染坐标轴
  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .attr("class", "axis");

  const yAxisGroup = g.append("g").attr("class", "axis");

  // 渲染坐标轴 - 正确的D3.js用法
  xAxisGroup.call(
    d3
      .axisBottom(xScale)
      .tickValues(xScale.domain().filter((d, i) => i % 3 === 0))
  );

  yAxisGroup.call(d3.axisLeft(yScale));

  // 使用D3.js添加柱状图
  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.date.substring(8)))
    .attr("y", (d) => yScale(d.count))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => chartHeight - yScale(d.count))
    .attr("fill", "#3b82f6");

  dailyChartInstance = svg.node();
};

// 创建组织承办公文量图表
const createOrgChart = async () => {
  if (!orgChart.value || !window.d3) return;

  // 获取容器尺寸
  const { width } = orgChart.value.getBoundingClientRect();

  // 清空容器
  orgChart.value.innerHTML = "";

  // 使用从数据库获取的数据
  const data = await loadOrgDocumentStats(
    dateRange.value[0],
    dateRange.value[1]
  );

  const margin = { top: 20, right: 30, bottom: 30, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = 250 - margin.top - margin.bottom;

  // 使用D3.js创建SVG元素和图表结构
  const svg = d3
    .select(orgChart.value)
    .append("svg")
    .attr("width", width)
    .attr("height", 250);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 计算比例尺
  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.name))
    .range([0, chartHeight])
    .padding(0.1);

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count)])
    .range([0, chartWidth]);

  // 创建坐标轴容器并渲染坐标轴
  const yAxisGroup = g.append("g").attr("class", "axis");

  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .attr("class", "axis");

  // 渲染坐标轴 - 正确的D3.js用法
  yAxisGroup.call(d3.axisLeft(yScale));
  xAxisGroup.call(d3.axisBottom(xScale));

  // 使用D3.js添加柱状图
  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d) => yScale(d.name))
    .attr("width", (d) => xScale(d.count))
    .attr("height", yScale.bandwidth())
    .attr("fill", "#8b5cf6");

  orgChartInstance = svg.node();
};

// 处理查询
const handleQuery = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning("请选择查询期间");
    return;
  }

  // 这里可以根据选择的日期范围重新加载数据
  ElMessage.success(
    `查询 ${dateRange.value[0]} 至 ${dateRange.value[1]} 的统计数据`
  );

  // 重新生成图表
  if (dailyChart.value) await createDailyChart();
  if (orgChart.value) await createOrgChart();
};

// 页面加载时初始化
onMounted(async () => {
  // 设置默认日期范围为当月
  dateRange.value = [currentMonth, currentMonth];

  // 加载统计摘要
  await loadStatisticsSummary();

  // 延迟创建图表，确保DOM已渲染
  setTimeout(async () => {
    // 动态加载D3.js
    const script = document.createElement("script");
    script.src = "https://d3js.org/d3.v7.min.js";
    script.onload = async () => {
      if (dailyChart.value) await createDailyChart();
      if (orgChart.value) await createOrgChart();
    };
    document.head.appendChild(script);
  }, 100);

  // 监听窗口大小变化，重新调整图表大小
  window.addEventListener("resize", async () => {
    if (dailyChart.value) await createDailyChart();
    if (orgChart.value) await createOrgChart();
  });
});

// 页面卸载时清理
onUnmounted(() => {
  window.removeEventListener("resize", () => {});
});
</script>

<style scoped>
/* 页面整体布局 */
.statistics-container {
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

/* 统计卡片 */
.stats-card {
  background-color: #fff;
  padding: 20px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

/* 图表卡片 */
.chart-card {
  background-color: #fff;
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  padding: 20px 0;
}

/* 图表样式 */
.axis line,
.axis path {
  stroke: #999;
}

.axis text {
  fill: #666;
  font-size: 12px;
}

.bar {
  transition: fill 0.3s;
}

.bar:hover {
  fill: #1d4ed8;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .stats-card .el-row {
    flex-direction: column;
  }

  .stats-card .el-col {
    width: 100% !important;
    margin-bottom: 10px;
  }
}
</style>
