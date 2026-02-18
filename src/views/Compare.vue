<script setup lang="ts">
import { computed, ref, watchEffect, onMounted} from "vue";
import { useRoute } from "vue-router"
import type { DogBreed } from "@/types/dogBreed";
import CompareSlotsBar from "@/components/CompareSlotsBar.vue";
import RadarChart from "@/components/RadarChart.vue";
import dogsJson from "@/data/dogs_ninjas_raw.json";
import { RADAR_AXES } from "@/d3Viz/createRadarChart"; 
import AxisSelector from "@/components/AxisSelector.vue";
import DumbbellChart from "@/components/DumbbellChart.vue";
import BoxPlotChart from "@/components/BoxPlotChart.vue";

const route = useRoute();

const dogs = ref<DogBreed[]>([]);
const allAxes = RADAR_AXES;
const activeAxes = ref([...allAxes]);

const focusIndex = ref<number | null>(null);

// 点击同一个 = 取消
function toggleFocus(i: number) {
  focusIndex.value = focusIndex.value === i ? null : i;
}

function addDogToSlots(dog: DogBreed) {
  if (slots.value.some((d) => d?.name === dog.name)) return;

  const emptyIdx = slots.value.findIndex((d) => d === null);
  if (emptyIdx === -1) {
    // if full, replace the last slot
    slots.value[MAX - 1] = dog;
  } else {
    slots.value[emptyIdx] = dog;
  }
}


onMounted(() => {
  dogs.value = dogsJson as DogBreed[];
});

const MAX = 5;
const slots = ref<(DogBreed | null)[]>(Array.from({ length: MAX }, () => null));

function setSlot(i: number, dog: DogBreed | null) {
  slots.value[i] = dog;
}

const selectedDogs = computed(() => slots.value.filter(Boolean) as DogBreed[]);

const DOG_COLORS = ["#2E6FBA", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"];
const selectedColors = computed(() => DOG_COLORS.slice(0, selectedDogs.value.length));

watchEffect(() => {
  const q = route.query?.add;
  const name = Array.isArray(q) ? q[0] : (q as string | undefined);
  if (!name || dogs.value.length === 0) return;

  const dog = dogs.value.find((d) => d.name === name);
  if (dog) addDogToSlots(dog);
});
</script>


<template>
  <main class="comparePage">
    <CompareSlotsBar
  :dogs="dogs"
  :slots="slots"
  :max="MAX"
  :focusIndex="focusIndex"
  @update-slot="setSlot"
  @toggle-focus="toggleFocus"
/>


    <section class="grid">
      <div class="panel big">
        <h3>Radar 对比</h3>
        <div class="radarChartWrap">
    <RadarChart
  :dogs="selectedDogs"
  :axes="activeAxes"
  :focusIndex="focusIndex"
  @toggleFocus="toggleFocus"
/>

  </div>
      </div>

      <div class="panel narrow">
        <h3>添加/减少维度</h3>
        <AxisSelector
    :allAxes="allAxes"
    :activeAxes="activeAxes"
    @update:activeAxes="(v) => activeAxes = v"
  />
      </div>

      <div class="panel">
        <h3>体型对比</h3>
        <DumbbellChart
          :dogs="selectedDogs"
          :colors="selectedColors"
          :focusIndex="focusIndex"
          @toggleFocus="toggleFocus"
        />
      </div>
      

      <div class="panel">
        <h3>箱型图</h3>
        <BoxPlotChart
    :allDogs="dogs"
    :selectedDogs="selectedDogs"
    :colors="selectedColors"
    :focusIndex="focusIndex"
    @toggleFocus="toggleFocus"
  />
      </div>
    </section>
  </main>
</template>

<style scoped>
.comparePage { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.grid { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; }
.panel { background: #f4f4f4; border-radius: 12px; padding: 12px; min-height: 220px; }
.panel.big { min-height: 500px; display: flex; flex-direction: column; }
.radarChartWrap { height: 400px; min-height: 320px; }
.panel.narrow { min-height: 320px; }
.hint { opacity: 0.7; margin-top: 8px; }
</style>
