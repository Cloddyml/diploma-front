import axios from "axios";

export async function getTaskHint(taskId, userMessage) {
    const res = await axios.post("/api/v1/ai/task-hint", {
        task_id: taskId,
        user_message: userMessage,
    });
    return res.data;
}

export async function getTopicHint(topicId, userMessage) {
    const res = await axios.post("/api/v1/ai/topic-hint", {
        topic_id: topicId,
        user_message: userMessage,
    });
    return res.data;
}
