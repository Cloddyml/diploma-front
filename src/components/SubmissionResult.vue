<template>
    <div v-if="submission" :class="['result', statusClass]">
        <span
            v-if="
                submission.status === 'pending' ||
                submission.status === 'running'
            "
        >
            Проверяется...
        </span>
        <span v-else-if="submission.status === 'accepted'">✓ Верно!</span>
        <span v-else-if="submission.status === 'wrong_answer'"
            >Неверный ответ</span
        >
        <span v-else-if="submission.status === 'time_limit'"
            >Превышено время выполнения</span
        >
        <span v-else-if="submission.status === 'memory_limit'"
            >Превышен лимит памяти</span
        >
        <span v-else-if="submission.status === 'runtime_error'"
            >Ошибка выполнения</span
        >
        <span v-else-if="submission.status === 'internal_error'"
            >Внутренняя ошибка сервера</span
        >
        <pre v-if="submission.result && submission.status === 'wrong_answer'">
            {{ formatResult(submission.result) }}
        </pre>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    submission: Object,
});

const statusClass = computed(() => {
    if (!props.submission) return "";
    switch (props.submission.status) {
        case "pending":
        case "running":
            return "pending";
        case "accepted":
            return "accepted";
        case "wrong_answer":
        case "time_limit":
        case "memory_limit":
            return "warning";
        case "runtime_error":
        case "internal_error":
            return "error";
        default:
            return "";
    }
});
</script>
