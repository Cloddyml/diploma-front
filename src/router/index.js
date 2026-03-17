import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import TopicView from "../views/TopicView.vue";
import TaskView from "../views/TaskView.vue";

const routes = [
    { path: "/", component: HomeView },
    { path: "/topics/:slug", component: TopicView },
    { path: "/topics/:slug/:id", component: TaskView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
