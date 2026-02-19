<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from "vue";
import { createRadarChart } from "@/d3Viz/createRadarChart";
import type { RadarDog, RadarKey } from "@/d3Viz/createRadarChart";
import { RADAR_COLORS } from "@/d3Viz/createRadarChart";

const props = defineProps<{
  dogs: RadarDog[]; // 选中的狗数组（0~5）
  axes: { key: RadarKey; label: string }[];
  focusIndex?: number | null;
}>();
const emit = defineEmits<{
  (e: "toggleFocus", index: number): void;
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const chartAreaRef = ref<HTMLDivElement | null>(null);

let chart: ReturnType<typeof createRadarChart> | null = null;
let ro: ResizeObserver | null = null;

const dogs = computed(() => props.dogs ?? []);

function legendColor(idx: number) {
  return RADAR_COLORS[idx % RADAR_COLORS.length];
}

function onLegendClick(idx: number) {
  console.log("[RadarChart] legend click idx =", idx, "current focus =", props.focusIndex);
  emit("toggleFocus", idx);
}

function resizeAndDraw() {
  if (!svgRef.value || !chart || !chartAreaRef.value) {
    console.warn("[RadarChart] resize skipped", {
      svg: !!svgRef.value,
      chart: !!chart,
      area: !!chartAreaRef.value,
    });
    return;
  }

  const rect = chartAreaRef.value.getBoundingClientRect();
  const w = Math.max(10, rect.width);
  const h = Math.max(10, rect.height);

  console.log("[RadarChart] draw", {
    w,
    h,
    dogs: props.dogs?.length,
    focus: props.focusIndex,
  });

  chart.update(props.dogs ?? [], {
    width: w,
    height: h,
    min: 0,
    max: 5,
    levels: 5,
    axes: props.axes,
    focusIndex: props.focusIndex ?? null,
  });
}

onMounted(() => {
  chart = createRadarChart(svgRef.value!);
  resizeAndDraw();

  ro = new ResizeObserver(() => requestAnimationFrame(resizeAndDraw));
  if (chartAreaRef.value) ro.observe(chartAreaRef.value);

  window.addEventListener("resize", resizeAndDraw);
});

watch(
  [() => props.dogs, () => props.axes, () => props.focusIndex],
  async () => {
    await nextTick();
    requestAnimationFrame(resizeAndDraw);
  },
  { deep: false },
);

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeAndDraw);
  ro?.disconnect();
  ro = null;
  chart?.destroy();
});
</script>

<template>
  <div class="wrap">
    <div class="chartArea" ref="chartAreaRef">
      <svg ref="svgRef"></svg>
      <div class="legend" v-if="dogs.length">
        <button
          v-for="(d, idx) in dogs"
          :key="d.name"
          class="legendRow"
          :class="{
            dim:
              props.focusIndex !== null &&
              props.focusIndex !== undefined &&
              props.focusIndex !== idx,
          }"
          @click="emit('toggleFocus', idx)"
          type="button"
        >
          <span class="dot" :style="{ backgroundColor: legendColor(idx) }"></span>
          <span class="label">{{ d.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  height: 100%;
  width: 100%;
  display: flex;
}
.chartArea {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;

  border-radius: 14px;
}
svg {
  width: 100%;
  height: 100%;
  display: block;
}
.legend {
  position: absolute;
  right: 12px;
  bottom: 12px;
  background: rgba(255, 248, 220, 0.95);
  border: 1px solid rgba(198, 142, 0, 0.35);
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 45%;
  pointer-events: auto;
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 12px rgba(198, 142, 0, 0.12);
}

.legendRow {
  all: unset;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.legendRow:hover {
  background: rgba(230, 168, 0, 0.12);
}

.legendRow.dim {
  opacity: 0.4;
}

.legendRow.dim:hover {
  opacity: 0.7;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex: 0 0 auto;
  box-shadow: 0 0 0 1px rgba(92, 66, 16, 0.15);
}

.label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(72, 52, 12, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
