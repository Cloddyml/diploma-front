<template>
    <div class="container">
        <h1>Подготовка к собеседованию</h1>
        <TopicsList :is-interview="true" />
    </div>
</template>

<script setup>
import TopicsList from "../components/TopicsList.vue";
</script>
