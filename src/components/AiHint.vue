<template>
    <div class="ai-hint">
        <h2>Подсказка от AI</h2>
        <textarea
            v-model="userMessage"
            rows="3"
            placeholder="Напишите свой вопрос по задаче..."
        />
        <button @click="loadHint" :disabled="loading || !userMessage.trim()">
            {{ loading ? "Думаю..." : "Спросить" }}
        </button>
        <div v-if="error" class="result error">{{ error }}</div>
        <div v-if="hint" class="ai-response">{{ hint }}</div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { getTaskHint } from "../api/ai";

const props = defineProps({
    taskId: Number,
});

const hint = ref(null);
const loading = ref(false);
const error = ref(null);
const userMessage = ref("");

async function loadHint() {
    const message = userMessage.value.trim();
    if (!message) return;

    loading.value = true;
    error.value = null;
    hint.value = null;
    try {
        const res = await getTaskHint(props.taskId, message);
        hint.value = res.ai_response;
    } catch (e) {
        error.value = "Не удалось получить подсказку. Попробуйте ещё раз.";
    } finally {
        loading.value = false;
    }
}
</script>
