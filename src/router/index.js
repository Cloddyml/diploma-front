import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import TopicView from "../views/TopicView.vue";
import TasksView from "../views/TasksView.vue";
import TaskView from "../views/TaskView.vue";

const routes = [
    { path: "/", component: HomeView, meta: { title: "Темы" } },
    { path: "/topics/:slug", component: TopicView },
    { path: "/topics/:slug/tasks", component: TasksView },
    { path: "/topics/:slug/tasks/:id", component: TaskView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.afterEach((to) => {
    document.title = to.meta.title ?? "Учебная платформа";
});

export default router;
