import { api } from "./client";

const TERMINAL_STATUSES = [
    "accepted",
    "wrong_answer",
    "time_limit",
    "memory_limit",
    "runtime_error",
    "internal_error",
];

const INITIAL_DELAY_MS = 500;
const MAX_DELAY_MS = 5000;
const BACKOFF_FACTOR = 1.5;
const MAX_ERRORS = 5;

export async function submitCode(topicSlug, taskId, code) {
    const res = await api.post(
        `/topics/${topicSlug}/tasks/${taskId}/submit`,
        { code },
    );
    return res.data;
}

/**
 * Опрашивает статус submission с экспоненциальной задержкой.
 * Возвращает функцию stop() для остановки опроса (например, в onBeforeUnmount).
 */
export function pollSubmission(submissionId, onResult, onError) {
    let stopped = false;
    let timeoutId = null;
    let errorCount = 0;
    let delay = INITIAL_DELAY_MS;

    async function tick() {
        if (stopped) return;
        try {
            const { data } = await api.get(`/submissions/${submissionId}`);
            if (TERMINAL_STATUSES.includes(data.status)) {
                stop();
                onResult(data);
                return;
            }
            errorCount = 0;
        } catch (e) {
            errorCount++;
            if (errorCount >= MAX_ERRORS) {
                stop();
                if (onError) {
                    onError(e);
                } else {
                    onResult({
                        status: "internal_error",
                        error: "Не удалось получить результат проверки.",
                    });
                }
                return;
            }
        }
        delay = Math.min(Math.round(delay * BACKOFF_FACTOR), MAX_DELAY_MS);
        timeoutId = setTimeout(tick, delay);
    }

    function stop() {
        stopped = true;
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    timeoutId = setTimeout(tick, delay);
    return stop;
}
