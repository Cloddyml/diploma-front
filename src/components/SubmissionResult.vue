<template>
    <div v-if="submission" :class="['result', statusClass]">
        <span>{{ statusLabel }}</span>

        <pre v-if="submission.result && submission.status === 'wrong_answer'">
            {{ formatResult(submission.result) }}
        </pre>

        <pre
            v-if="submission.error && submission.status === 'runtime_error'"
            class="error-text"
            >{{ submission.error }}</pre
        >
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    submission: Object,
});

// Текст и визуальный класс по статусу. Один объект — одно место правок.
const STATUS_LABELS = {
    pending: "Проверяется...",
    running: "Проверяется...",
    accepted: "✓ Верно!",
    wrong_answer: "Неверный ответ",
    time_limit: "Превышено время выполнения",
    memory_limit: "Превышен лимит памяти",
    runtime_error: "Ошибка выполнения",
    internal_error: "Внутренняя ошибка сервера",
};

const STATUS_CLASSES = {
    pending: "pending",
    running: "pending",
    accepted: "accepted",
    wrong_answer: "warning",
    time_limit: "warning",
    memory_limit: "warning",
    runtime_error: "error",
    internal_error: "error",
};

const statusLabel = computed(
    () => STATUS_LABELS[props.submission?.status] ?? "",
);
const statusClass = computed(
    () => STATUS_CLASSES[props.submission?.status] ?? "",
);

function formatResult(result) {
    if (!result) return "";
    try {
        const parsed = JSON.parse(result);
        return parsed
            .map((r) => {
                const errorText =
                    r.error === "wrong_answer"
                        ? "неверный ответ"
                        : r.error || "неизвестная ошибка";
                return `Тест ${r.test}: ${errorText}`;
            })
            .join("\n");
    } catch {
        return result;
    }
}
</script>
