<template>
  <el-container class="doc-config-container">
    <!-- 页面标题栏 -->
    <el-header class="page-header">
      <div class="header-content">
        <h1>系统帮助</h1>
      </div>
    </el-header>

    <!-- 主要内容区 -->
    <el-main class="main-content">
      <!-- 帮助导航 -->
      <el-card class="help-card" style="margin-bottom: 20px">
        <el-tabs v-model="activeTab" type="border-card" class="help-tabs">
          <el-tab-pane label="使用指南" name="guide">
            <div class="help-content">
              <h4>公文管理使用流程</h4>
              <ol class="guide-steps">
                <li>
                  <h4>组织配置</h4>
                  <p>
                    在配置-》组织管理配置页面点击"新增组织"按钮，正确填写组织信息，最后点击"保存"。
                    新增组织后，您可以在组织管理页面查看和管理所有组织。
                  </p>
                </li>
                <li>
                  <h4>人员配置</h4>
                  <p>
                    在配置-》人员管理配置页面点击"新增人员"按钮，正确填写人员信息，最后点击"保存"。
                    新增人员后，您可以在人员管理页面查看和管理所有人员。
                  </p>
                </li>
                <li>
                  <h4>新增公文</h4>
                  <p>
                    在公文管理页面点击"新增公文"按钮，填写公文信息，包括公文名称、编号、文种、来文单位等，选择承办单位和承办人员，最后点击"保存"。
                  </p>
                </li>
                <li>
                  <h4>处理待办公文</h4>
                  <p>
                    在公文待办页面查看需要处理的公文，系统会根据截止日期显示提醒信息。点击"完成"按钮标记公文为已处理。
                  </p>
                </li>

                <li>
                  <h4>备份数据</h4>
                  <p>
                    定期使用系统提供的备份功能，确保数据安全。在相关页面选择备份路径并执行备份操作。
                  </p>
                </li>
              </ol>
            </div>
          </el-tab-pane>

          <el-tab-pane label="常见问题" name="faq">
            <div class="help-content">
              <el-collapse class="faq-collapse">
                <el-collapse-item title="如何快速找到我需要处理的公文？">
                  <div class="faq-content">
                    <p>您可以通过以下方式快速找到需要处理的公文：</p>
                    <ul>
                      <li>
                        1. 点击顶部菜单中的"公文待办"，查看所有需要您处理的公文
                      </li>
                      <li>
                        2. 使用页面顶部的搜索框，输入公文名称关键词进行搜索
                      </li>
                      <li>3. 使用承办单位筛选功能，筛选特定部门的公文</li>
                    </ul>
                  </div>
                </el-collapse-item>
                <el-collapse-item title="为什么有些公文会显示红色或黄色提醒？">
                  <div class="faq-content">
                    <p>系统根据公文的截止日期自动计算提醒状态：</p>
                    <ul>
                      <li>• 红色提醒：公文已超过截止日期或者公文当日需办结</li>
                      <li>• 黄色提醒：公文即将到达截止日期（通常为1-2天内）</li>
                      <li>• 绿色显示：距离截止日期还有足够时间</li>
                    </ul>
                  </div>
                </el-collapse-item>
                <el-collapse-item title="如何备份系统数据？">
                  <div class="faq-content">
                    <p>
                      系统提供了数据备份功能，您可以在相关页面找到备份选项，选择合适的存储路径并执行备份操作。建议定期备份以防止数据丢失。
                    </p>
                  </div>
                </el-collapse-item>

                <el-collapse-item title="如何修改已提交的公文信息？">
                  <div class="faq-content">
                    <p>
                      在公文管理页面，找到需要修改的公文，点击编辑按钮进行修改。请注意，已完成的公文可能不允许修改，具体限制请参考系统设置。
                    </p>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 联系支持 -->
      <el-card class="support-card">
        <div class="support-content">
          <h4>获取更多帮助</h4>
          <p>如果您在使用过程中遇到问题，请联系我们的技术支持团队。</p>
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from "vue";
import {
  Document,
  Search,
  User,
  Phone,
  Message,
} from "@element-plus/icons-vue";

// 当前激活的标签页
const activeTab = ref("guide");
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
.help-content {
  padding: 15px;
}

.help-tabs {
  width: 100%;
}

.help-content h3 {
  color: #303133;
  margin-bottom: 15px;
}

.help-content h4 {
  color: #606266;
  margin: 10px 0;
}

.help-content p {
  color: #606266;
  line-height: 1.8;
}

.feature-card {
  text-align: left;
  height: 100%;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 36px;
  color: #409eff;
  margin-bottom: 10px;
}

.guide-steps {
  text-align: left;
  padding-left: 10px;
}

.guide-steps li {
  margin-bottom: 20px;
}

.faq-collapse .el-collapse-item__header {
  font-weight: 600;
}

.faq-content {
  text-align: left;
  padding: 10px 0;
}

.faq-content ul {
  padding-left: 20px;
  margin: 10px 0;
}

.faq-content li {
  margin-bottom: 5px;
  color: #606266;
}

.support-card {
  background-color: #f0f9ff;
  border-color: #bae7ff;
}

.support-content {
  text-align: center;
  padding: 20px;
}

.support-contact {
  margin-top: 10px;
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.contact-icon {
  font-size: 20px;
  color: #409eff;
  margin-right: 10px;
}

.contact-text {
  color: #606266;
}
</style>
