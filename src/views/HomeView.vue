<template>
    <div class="container">
        <h1>Темы</h1>
        <TopicsList :is-interview="false" />
    </div>
</template>

<script setup>
import TopicsList from "../components/TopicsList.vue";
</script>
