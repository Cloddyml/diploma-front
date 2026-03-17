<template>
    <div class="ai-hint">
        <h2>Подсказка от AI</h2>
        <textarea v-model="userMessage" rows="3" :placeholder="placeholder" />
        <button @click="loadHint" :disabled="loading || !userMessage.trim()">
            {{ loading ? "Думаю..." : "Спросить" }}
        </button>
        <div v-if="error" class="result error">{{ error }}</div>
        <div
            v-if="hint"
            class="ai-response markdown-body"
            v-html="renderedHint"
        />
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { marked } from "marked";
import { getTaskHint, getTopicHint } from "../api/ai";

const props = defineProps({
    taskId: { type: Number, default: null },
    topicId: { type: Number, default: null },
});

const hint = ref(null);
const loading = ref(false);
const error = ref(null);
const userMessage = ref("");

const placeholder = computed(() =>
    props.topicId
        ? "Напишите свой вопрос по теме..."
        : "Напишите свой вопрос по задаче...",
);

const renderedHint = computed(() =>
    hint.value ? marked.parse(hint.value) : "",
);

async function loadHint() {
    const message = userMessage.value.trim();
    if (!message) return;

    loading.value = true;
    error.value = null;
    hint.value = null;
    try {
        const res = props.topicId
            ? await getTopicHint(props.topicId, message)
            : await getTaskHint(props.taskId, message);
        hint.value = res.ai_response;
    } catch (e) {
        error.value = "Не удалось получить подсказку. Попробуйте ещё раз.";
    } finally {
        loading.value = false;
    }
}
</script>
