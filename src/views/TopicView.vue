<template>
    <div class="container">
        <RouterLink to="/" class="back">← Назад</RouterLink>
        <div v-if="loading" class="status">Загрузка...</div>
        <div v-else-if="error" class="status error">Ошибка: {{ error }}</div>
        <div v-else>
            <!-- AI-бар вверху -->
            <AiHint :topicId="topic.id" />

            <h1>{{ topic.title }}</h1>

            <!-- Чекбокс завершения темы -->
            <label class="completion-row" :class="{ done: topic.is_completed }">
                <input
                    type="checkbox"
                    :checked="topic.is_completed"
                    @change="toggleCompletion"
                />
                <span class="completion-label">
                    {{
                        topic.is_completed
                            ? "Тема изучена ✓"
                            : "Отметить как изученную"
                    }}
                </span>
            </label>

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
                <button class="btn-tasks">Перейти к задачам →</button>
            </RouterLink>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { marked } from "marked";
import { getPublishedTopic, markTopicProgress } from "../api/topics";
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

async function toggleCompletion() {
    const newVal = !topic.value.is_completed;
    topic.value.is_completed = newVal;
    try {
        await markTopicProgress(slug, newVal);
    } catch {
        topic.value.is_completed = !newVal;
    }
}
</script>
