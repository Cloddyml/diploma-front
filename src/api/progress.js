import { api } from "./client";

export async function getProgress(days = 30) {
    const res = await api.get("/progress", { params: { days } });
    return res.data;
}
