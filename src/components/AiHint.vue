<template>
    <!-- Бар-триггер -->
    <div class="ai-hint-bar">
        <div class="ai-hint-bar-info">
            <span>AI-ассистент может помочь разобраться</span>
        </div>
        <button class="btn-ai" @click="open = true">Спросить AI</button>
    </div>

    <!-- Модальное окно -->
    <teleport to="body">
        <div v-if="open" class="ai-modal-overlay" @click.self="open = false">
            <div class="ai-modal">
                <div class="ai-modal-header">
                    <span class="ai-modal-title"> AI-подсказка </span>
                    <button class="btn-close" @click="open = false">×</button>
                </div>

                <div class="ai-modal-notice">
                    ⚠️ Бот не запоминает историю диалога — каждый вопрос
                    обрабатывается независимо.
                </div>

                <div class="ai-modal-body">
                    <textarea
                        v-model="userMessage"
                        rows="3"
                        :placeholder="placeholder"
                    />
                    <button
                        @click="loadHint"
                        :disabled="loading || !userMessage.trim()"
                    >
                        {{ loading ? "Думаю..." : "Отправить" }}
                    </button>

                    <div v-if="error" class="ai-error">{{ error }}</div>

                    <div
                        v-if="hint"
                        class="ai-response markdown-body"
                        v-html="renderedHint"
                    />
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup>
import { ref, computed } from "vue";
import { marked } from "marked";
import { getTaskHint, getTopicHint } from "../api/ai";

const props = defineProps({
    taskId: { type: Number, default: null },
    topicId: { type: Number, default: null },
});

const open = ref(false);
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
    } catch {
        error.value = "Не удалось получить подсказку. Попробуйте ещё раз.";
    } finally {
        loading.value = false;
    }
}
</script>
