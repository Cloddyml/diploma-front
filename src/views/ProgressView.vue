<template>
    <div class="container">
        <h1>Прогресс</h1>

        <div v-if="loading" class="status">Загрузка...</div>
        <div v-else-if="error" class="status error">Ошибка: {{ error }}</div>
        <template v-else>
            <!-- Сводные карточки -->
            <div class="dashboard-cards">
                <div class="dashboard-card">
                    <span class="dashboard-card-value">
                        {{ data.completed_topics }} / {{ data.total_topics }}
                    </span>
                    <span class="dashboard-card-label">Тем изучено</span>
                    <div class="progress-bar" style="margin-top: 12px">
                        <div
                            class="progress-fill"
                            :class="{
                                'all-done':
                                    data.completed_topics ===
                                        data.total_topics &&
                                    data.total_topics > 0,
                            }"
                            :style="{
                                width:
                                    pct(
                                        data.completed_topics,
                                        data.total_topics,
                                    ) + '%',
                            }"
                        />
                    </div>
                </div>

                <div class="dashboard-card">
                    <span class="dashboard-card-value">
                        {{ data.completed_tasks }} / {{ data.total_tasks }}
                    </span>
                    <span class="dashboard-card-label">Заданий выполнено</span>
                    <div class="progress-bar" style="margin-top: 12px">
                        <div
                            class="progress-fill"
                            :class="{
                                'all-done':
                                    data.completed_tasks === data.total_tasks &&
                                    data.total_tasks > 0,
                            }"
                            :style="{
                                width:
                                    pct(
                                        data.completed_tasks,
                                        data.total_tasks,
                                    ) + '%',
                            }"
                        />
                    </div>
                </div>

                <div class="dashboard-card">
                    <span class="dashboard-card-value">{{
                        totalAccepted
                    }}</span>
                    <span class="dashboard-card-label">Успешных попыток</span>
                </div>

                <div class="dashboard-card">
                    <span class="dashboard-card-value">{{ activeDays }}</span>
                    <span class="dashboard-card-label">Активных дней</span>
                </div>
            </div>

            <!-- График активности -->
            <div class="chart-section">
                <div class="chart-header">
                    <h2>Активность за {{ days }} дней</h2>
                    <div class="chart-legend">
                        <span class="chart-legend-dot chart-dot-accepted" />
                        <span>Успешных</span>
                        <span class="chart-legend-dot chart-dot-total" />
                        <span>Всего попыток</span>
                    </div>
                </div>

                <div v-if="data.daily_stats.length === 0" class="status">
                    Нет данных за выбранный период
                </div>

                <div v-else class="chart-scroll">
                    <div class="chart-bars">
                        <div
                            v-for="stat in data.daily_stats"
                            :key="stat.date"
                            class="chart-col"
                            :title="`${formatDate(stat.date)}\nПопыток: ${stat.submissions_total}\nУспешных: ${stat.submissions_accepted}\nВыполнено заданий: ${stat.tasks_completed}`"
                        >
                            <div class="chart-bar-pair">
                                <div
                                    class="chart-bar chart-bar-total"
                                    :style="{
                                        height:
                                            barHeight(stat.submissions_total) +
                                            'px',
                                    }"
                                />
                                <div
                                    class="chart-bar chart-bar-accepted"
                                    :style="{
                                        height:
                                            barHeight(
                                                stat.submissions_accepted,
                                            ) + 'px',
                                    }"
                                />
                            </div>
                            <span class="chart-bar-label">{{
                                shortDate(stat.date)
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getProgress } from "../api/progress";

const days = 30;
const data = ref(null);
const loading = ref(true);
const error = ref(null);

const totalAccepted = computed(() =>
    data.value
        ? data.value.daily_stats.reduce((s, d) => s + d.submissions_accepted, 0)
        : 0,
);

const activeDays = computed(() =>
    data.value
        ? data.value.daily_stats.filter((d) => d.submissions_total > 0).length
        : 0,
);

const maxTotal = computed(() =>
    data.value && data.value.daily_stats.length > 0
        ? Math.max(...data.value.daily_stats.map((d) => d.submissions_total), 1)
        : 1,
);

const CHART_MAX_HEIGHT = 120;

function barHeight(value) {
    return Math.round((value / maxTotal.value) * CHART_MAX_HEIGHT);
}

function pct(done, total) {
    if (!total) return 0;
    return Math.round((done / total) * 100);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
    });
}

function shortDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

onMounted(async () => {
    try {
        data.value = await getProgress(days);
    } catch (e) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
});
</script>
