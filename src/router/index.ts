import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router"; // 使用type-only import
import Home from "../views/Home.vue";
import Settings from "../views/Settings.vue";
import Document from "../views/Document.vue";
import SetEmp from "../views/SetEmp.vue";
import SetOrg from "../views/SetOrg.vue";
import DocumentTodo from "../views/DocumentTodo.vue";
import Statistics from "../views/Statistics.vue";
import Help from "../views/Help.vue";
import Backup from "../views/Backup.vue";

const routes: Array<RouteRecordRaw> = [
  { path: "/", name: "Home", component: Home },
  { path: "/settings", name: "Settings", component: Settings },

  { path: "/settings/emp", name: "SetEmp", component: SetEmp },
  { path: "/settings/org", name: "SetOrg", component: SetOrg },

  { path: "/document", name: "Document", component: Document },
  { path: "/document/todo", name: "DocumentTodo", component: DocumentTodo },
  { path: "/statistics", name: "Statistics", component: Statistics },
  { path: "/help", name: "Help", component: Help },
  { path: "/settings/backup", name: "Backup", component: Backup },
];

const router = createRouter({
  history: createWebHashHistory(), // Electron 中推荐使用 hash 模式
  routes,
});

export default router;
