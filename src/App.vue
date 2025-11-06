<!-- src/App.vue -->
<template>
  <router-view />
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  // 监听主进程发送的 navigate 事件
  window.electronAPI.onNavigate((path) => {
    console.log("收到路由跳转指令：", path); // 用于调试
    router.push(path); // 执行路由跳转
  });
});
</script>
<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  max-width: 1920px; /* 新的最大宽度 */
  overflow: hidden; /* 可选：避免滚动条干扰 */
}
</style>
