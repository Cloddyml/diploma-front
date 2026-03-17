<template>
    <div class="container">
        <RouterLink :to="`/topics/${slug}`" class="back">← Назад</RouterLink>
        <h1>Задачи</h1>
        <div v-if="loading" class="status">Загрузка...</div>
        <div v-else-if="error" class="status error">Ошибка: {{ error }}</div>
        <ul v-else>
            <li v-for="task in tasks" :key="task.id">
                <RouterLink :to="`/topics/${slug}/tasks/${task.id}`">
                    {{ task.title }}
                </RouterLink>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getPublishedTasks } from "../api/tasks";

const route = useRoute();
const slug = route.params.slug;

const tasks = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
    try {
        tasks.value = await getPublishedTasks(slug);
    } catch (e) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
});
</script>
