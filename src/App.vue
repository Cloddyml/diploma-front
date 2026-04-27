<template>
    <nav class="navbar">
        <div class="navbar-inner">
            <RouterLink class="navbar-brand" to="/">ai-studing</RouterLink>
            <div class="navbar-links">
                <RouterLink class="navbar-link" to="/">Темы</RouterLink>
                <RouterLink class="navbar-link" to="/interview"
                    >Собеседование</RouterLink
                >
                <RouterLink class="navbar-link" to="/progress"
                    >Прогресс</RouterLink
                >
            </div>
        </div>
    </nav>
    <RouterView />
</template>
