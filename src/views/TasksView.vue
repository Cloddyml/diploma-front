<template>
    <div class="container">
        <RouterLink :to="`/topics/${slug}`" class="back">← Назад</RouterLink>
        <h1>Задачи</h1>
        <div v-if="loading" class="status">Загрузка...</div>
        <div v-else-if="error" class="status error">Ошибка: {{ error }}</div>
        <template v-else>
            <!-- Прогресс-бар -->
            <div class="progress-section">
                <div class="progress-header">
                    <span class="progress-title">Прогресс по заданиям</span>
                    <span class="progress-count"
                        >{{ completedCount }} / {{ tasks.length }}</span
                    >
                </div>
                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :class="{
                            'all-done':
                                completedCount === tasks.length &&
                                tasks.length > 0,
                        }"
                        :style="{ width: progressPercent + '%' }"
                    />
                </div>
            </div>

            <!-- Список заданий -->
            <ul>
                <li
                    v-for="task in tasks"
                    :key="task.id"
                    class="list-item"
                    :class="{ completed: task.is_completed }"
                >
                    <input
                        type="checkbox"
                        class="item-checkbox"
                        :checked="task.is_completed"
                        @change="toggleTask(task)"
                    />
                    <RouterLink
                        class="list-item-title"
                        :to="`/topics/${slug}/tasks/${task.id}`"
                    >
                        {{ task.title }}
                    </RouterLink>
                </li>
            </ul>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getPublishedTasks, markTaskProgress } from "../api/tasks";

const route = useRoute();
const slug = route.params.slug;

const tasks = ref([]);
const loading = ref(true);
const error = ref(null);

const completedCount = computed(
    () => tasks.value.filter((t) => t.is_completed).length,
);
const progressPercent = computed(() =>
    tasks.value.length === 0
        ? 0
        : Math.round((completedCount.value / tasks.value.length) * 100),
);

onMounted(async () => {
    try {
        tasks.value = await getPublishedTasks(slug);
        document.title = `${slug} — Задачи`;
    } catch (e) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
});

async function toggleTask(task) {
    const newVal = !task.is_completed;
    task.is_completed = newVal;
    try {
        await markTaskProgress(slug, task.id, newVal);
    } catch {
        task.is_completed = !newVal;
    }
}
</script>
