<template>
    <div class="container">
        <h1>Темы</h1>
        <div v-if="loading" class="status">Загрузка...</div>
        <div v-else-if="error" class="status error">Ошибка: {{ error }}</div>
        <template v-else>
            <!-- Прогресс-бар -->
            <div class="progress-section">
                <div class="progress-header">
                    <span class="progress-title">Прогресс по темам</span>
                    <span class="progress-count"
                        >{{ completedCount }} / {{ topics.length }}</span
                    >
                </div>
                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :class="{
                            'all-done':
                                completedCount === topics.length &&
                                topics.length > 0,
                        }"
                        :style="{ width: progressPercent + '%' }"
                    />
                </div>
            </div>

            <!-- Список тем -->
            <ul>
                <li
                    v-for="topic in topics"
                    :key="topic.id"
                    class="list-item"
                    :class="{ completed: topic.is_completed }"
                >
                    <input
                        type="checkbox"
                        class="item-checkbox"
                        :checked="topic.is_completed"
                        @change="toggleTopic(topic)"
                    />
                    <RouterLink
                        class="list-item-title"
                        :to="`/topics/${topic.slug}`"
                    >
                        {{ topic.title }}
                    </RouterLink>
                </li>
            </ul>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getPublishedTopics, markTopicProgress } from "../api/topics";

const topics = ref([]);
const loading = ref(true);
const error = ref(null);

const completedCount = computed(
    () => topics.value.filter((t) => t.is_completed).length,
);
const progressPercent = computed(() =>
    topics.value.length === 0
        ? 0
        : Math.round((completedCount.value / topics.value.length) * 100),
);

onMounted(async () => {
    try {
        topics.value = await getPublishedTopics();
    } catch (e) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
});

async function toggleTopic(topic) {
    const newVal = !topic.is_completed;
    topic.is_completed = newVal;
    try {
        await markTopicProgress(topic.slug, newVal);
    } catch {
        topic.is_completed = !newVal;
    }
}
</script>
