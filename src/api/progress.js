import axios from "axios";

export async function getProgress(days = 30) {
    const res = await axios.get("/api/v1/progress", { params: { days } });
    return res.data;
}
