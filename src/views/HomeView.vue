<template>
    <div class="container">
        <h1>Темы</h1>
        <div v-if="loading" class="status">Загрузка...</div>
        <div v-else-if="error" class="status error">Ошибка: {{ error }}</div>
        <ul v-else>
            <li v-for="topic in topics" :key="topic.id">
                <RouterLink :to="`/topics/${topic.slug}`">{{
                    topic.title
                }}</RouterLink>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getPublishedTopics } from "../api/topics";

const topics = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
    try {
        topics.value = await getPublishedTopics();
    } catch (e) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
});
</script>
