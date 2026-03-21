import axios from "axios";

export async function getPublishedTopics() {
    const res = await axios.get(`/api/v1/topics/published`);
    return res.data;
}

export async function getPublishedTopic(topicSlug) {
    const res = await axios.get(`/api/v1/topics/${topicSlug}`);
    return res.data;
}

export async function markTopicProgress(topicSlug, isCompleted) {
    await axios.patch(`/api/v1/topics/${topicSlug}/progress`, {
        is_completed: isCompleted,
    });
}
