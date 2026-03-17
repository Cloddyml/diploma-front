import axios from "axios";

export async function getPublishedTasks(topicSlug) {
    const res = await axios.get(`/api/v1/topics/${topicSlug}/tasks/published`);
    return res.data;
}

export async function getPublishedTask(topicSlug, taskId) {
    const res = await axios.get(
        `/api/v1/topics/${topicSlug}/tasks/${taskId}/published`,
    );
    return res.data;
}
