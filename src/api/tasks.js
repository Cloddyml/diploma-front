import axios from "axios";

export async function getPublishedTasks(topicSlug) {
    const res = await axios.get(`/api/v1/topics/${topicSlug}/tasks/published`);
    return res.data;
}
