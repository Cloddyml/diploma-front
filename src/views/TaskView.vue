<template>
    <div class="container">
        <RouterLink :to="`/topics/${slug}/tasks`" class="back"
            >← Назад</RouterLink
        >
        <div v-if="loading" class="status">Загрузка...</div>
        <div v-else-if="error" class="status error">Ошибка: {{ error }}</div>
        <div v-else>
            <!-- AI-бар вверху -->
            <AiHint :taskId="task.id" />

            <h1>{{ task.title }}</h1>

            <!-- Чекбокс завершения задания -->
            <label class="completion-row" :class="{ done: task.is_completed }">
                <input
                    type="checkbox"
                    :checked="task.is_completed"
                    @change="toggleCompletion"
                />
                <span class="completion-label">
                    {{
                        task.is_completed
                            ? "Задание выполнено ✓"
                            : "Отметить как выполненное"
                    }}
                </span>
            </label>

            <div
                class="task-description markdown-body"
                v-html="renderedDescription"
            />

            <h2>Решение</h2>
            <CodeEditor v-model="code" @reset="code = starterCode" />
            <button @click="submitSolution" :disabled="submitting">
                {{ submitting ? "Отправляю..." : "Отправить" }}
            </button>
            <SubmissionResult :submission="submission" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { marked } from "marked";
import { getPublishedTask, markTaskProgress } from "../api/tasks";
import { submitCode, pollSubmission } from "../api/submissions";
import CodeEditor from "../components/CodeEditor.vue";
import SubmissionResult from "../components/SubmissionResult.vue";
import AiHint from "../components/AiHint.vue";

const route = useRoute();
const slug = route.params.slug;
const taskId = Number(route.params.id);

const task = ref(null);
const starterCode = ref("");
const code = ref("");
const loading = ref(true);
const error = ref(null);
const submitting = ref(false);
const submission = ref(null);

const renderedDescription = computed(() =>
    task.value?.description ? marked.parse(task.value.description) : "",
);

onMounted(async () => {
    try {
        task.value = await getPublishedTask(slug, taskId);
        starterCode.value = task.value.starter_code || "";
        code.value = starterCode.value;
    } catch (e) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
});

async function toggleCompletion() {
    const newVal = !task.value.is_completed;
    task.value.is_completed = newVal;
    try {
        await markTaskProgress(slug, taskId, newVal);
    } catch {
        task.value.is_completed = !newVal;
    }
}

async function submitSolution() {
    submitting.value = true;
    submission.value = { status: "pending" };
    try {
        const created = await submitCode(slug, taskId, code.value);
        pollSubmission(created.submission_id, (result) => {
            submission.value = result;
            submitting.value = false;
        });
    } catch (e) {
        error.value = e.message;
        submitting.value = false;
    }
}
</script>
