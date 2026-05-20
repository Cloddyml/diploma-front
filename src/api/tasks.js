import { api } from "./client";

export async function getPublishedTasks(topicSlug) {
    const res = await api.get(`/topics/${topicSlug}/tasks/published`);
    return res.data;
}

export async function getPublishedTask(topicSlug, taskId) {
    const res = await api.get(`/topics/${topicSlug}/tasks/${taskId}/published`);
    return res.data;
}

export async function markTaskProgress(topicSlug, taskId, isCompleted) {
    await api.patch(`/topics/${topicSlug}/tasks/${taskId}/progress`, {
        is_completed: isCompleted,
    });
}
