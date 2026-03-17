import axios from "axios";

const TERMINAL_STATUSES = [
    "accepted",
    "wrong_answer",
    "time_limit",
    "memory_limit",
    "runtime_error",
    "internal_error",
];

export async function submitCode(topicSlug, taskId, code) {
    const res = await axios.post(
        `/api/v1/topics/${topicSlug}/tasks/${taskId}/submit`,
        { code },
    );
    return res.data;
}

export function pollSubmission(submissionId, onResult, onError) {
    let errorCount = 0;
    const MAX_ERRORS = 5;

    const interval = setInterval(async () => {
        try {
            const res = await axios.get(`/api/v1/submissions/${submissionId}`);
            if (TERMINAL_STATUSES.includes(res.data.status)) {
                clearInterval(interval);
                onResult(res.data);
            }
        } catch (e) {
            errorCount++;
            if (errorCount >= MAX_ERRORS) {
                clearInterval(interval);
                if (onError) {
                    onError(e);
                } else {
                    onResult({
                        status: "internal_error",
                        error: "Не удалось получить результат проверки.",
                    });
                }
            }
        }
    }, 1500);

    return interval;
}
