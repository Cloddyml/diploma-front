import axios from "axios";

export async function getPublishedTopics() {
    const res = await axios.get("/api/v1/topics/published");
    return res.data;
}
