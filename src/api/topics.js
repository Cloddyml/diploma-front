import { api } from "./client";

export async function getPublishedTopics(isInterview = false) {
    const res = await api.get("/topics/published", {
        params: { is_interview: isInterview },
    });
    return res.data;
}

export async function getPublishedTopic(topicSlug) {
    const res = await api.get(`/topics/${topicSlug}`);
    return res.data;
}

export async function markTopicProgress(topicSlug, isCompleted) {
    await api.patch(`/topics/${topicSlug}/progress`, {
        is_completed: isCompleted,
    });
}
