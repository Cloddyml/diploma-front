import { api } from "./client";

export async function getTaskHint(taskId, userMessage) {
    const res = await api.post("/ai/task-hint", {
        task_id: taskId,
        user_message: userMessage,
    });
    return res.data;
}

export async function getTopicHint(topicId, userMessage) {
    const res = await api.post("/ai/topic-hint", {
        topic_id: topicId,
        user_message: userMessage,
    });
    return res.data;
}
