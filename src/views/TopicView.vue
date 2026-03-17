<template>
    <div class="container">
        <RouterLink to="/" class="back">← Назад</RouterLink>
        <div v-if="loading" class="status">Загрузка...</div>
        <div v-else-if="error" class="status error">Ошибка: {{ error }}</div>
        <div v-else>
            <h1>{{ topic.title }}</h1>
            <div
                v-if="topic.content"
                class="task-description markdown-body"
                v-html="renderedContent"
            />
            <div
                v-else
                class="task-description"
                style="color: var(--text-muted)"
            >
                Теория для этой темы пока не добавлена.
            </div>
            <RouterLink :to="`/topics/${topic.slug}/tasks`">
                <button style="margin-top: 24px">Перейти к задачам →</button>
            </RouterLink>
            <AiHint :topicId="topic.id" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { marked } from "marked";
import { getPublishedTopic } from "../api/topics";
import AiHint from "../components/AiHint.vue";

const route = useRoute();
const slug = route.params.slug;

const topic = ref(null);
const loading = ref(true);
const error = ref(null);

const renderedContent = computed(() =>
    topic.value?.content ? marked.parse(topic.value.content) : "",
);

onMounted(async () => {
    try {
        topic.value = await getPublishedTopic(slug);
    } catch (e) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
});
</script>
