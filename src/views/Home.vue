<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import ScatterPlot from "@/components/ScatterPlot.vue";
import dogsJson from "@/data/dogs_ninjas_raw.json";
import type { DogBreed } from "@/types/dogBreed";
import type { ScatterDatum } from "@/types/viz";
import TraitLineChart from "@/components/TraitLineChart.vue";
import HeightCompareChart from "@/components/HeightCompareChart.vue";
import { computeAverageTraits } from "@/utils/computeAverageTraits";
import BeeswarmPlot from "@/components/BeeWarmPlot.vue";
import { traitLabels } from "@/utils/traitFilter";
import theDogApiBreeds from "@/data/dogs_thedogapi_breeds.json";
import { findBreedGroupByName } from "@/utils/fuzzyBreedGroup";
import {
  TRAIT_KEYS,
  type TraitKey,
  createDefaultTraitEnabled,
  filterDogsBySelectedTraits,
  
} from "@/utils/traitFilter";


const router = useRouter();
const dogs = ref<DogBreed[]>([]);
const selectedName = ref<string>("");

const avgTraits = ref(computeAverageTraits([] as DogBreed[]));

const selectedDog = computed(() => dogs.value.find((d) => d.name === selectedName.value) ?? null);

// 映射成 scatter 数据（示例：身高 vs 体重）
const scatterData = computed<ScatterDatum[]>(() =>
  filteredDogs.value.map((d) => ({
    id: d.name,
    label: d.name,
    x: (d.max_height_male + d.max_height_female) / 2,
    y: (d.max_weight_male + d.max_weight_female) / 2,
    size: d.max_life_expectancy,
  })),
);

const highlightId = computed(() => selectedDog.value?.name ?? null);
const selectedBreedGroup = computed(() => {
  const dogName = selectedDog.value?.name;
  if (!dogName) return null;
  return findBreedGroupByName(
    dogName,
    theDogApiBreeds as { name: string; breed_group?: string | null }[],
  );
});

const filterEnabled = ref(false);
const traitEnabled = reactive<Record<TraitKey, boolean>>(createDefaultTraitEnabled());

function toggleTrait(k: TraitKey, v: boolean) {
  traitEnabled[k] = v;
}

const filteredDogs = computed(() =>
  filterDogsBySelectedTraits(dogs.value, selectedDog.value, filterEnabled.value, traitEnabled),
);

const filteredCount = computed(() => filteredDogs.value.length);
const totalCount = computed(() => dogs.value.length);

const listDogs = computed(() => {
  const list = filteredDogs.value.slice(); // 当前筛选结果 = scatterplot 的数据源
  const sel = selectedDog.value;
  if (!sel) return list;

  // 如果筛选结果里没有选中狗，也要把它插进来（否则用户会懵）
  const withoutSel = list.filter((d) => d.name !== sel.name);
  return [sel, ...withoutSel];
});

function onSelectDog(id: string | number) {
  selectedName.value = String(id);
}

function sendToCompare() {
  const dog = selectedDog.value;
  if (!dog) return;
  const name = dog.name;

  try {
    // fallback：如果路由 query 丢了，Compare 页面还能从 localStorage 接到
    localStorage.setItem("compare_add", name);
  } catch (_) {
    // ignore storage failures
  }

  // 通过 query 把名字带去 Compare
  router.push({ path: "/compare", query: { add: name } });
}

const beeswarmTraits = computed<TraitKey[]>(() => {
  const enabled = TRAIT_KEYS.filter((k) => traitEnabled[k]);
  return enabled.length ? enabled : [...TRAIT_KEYS];
});

onMounted(() => {
  dogs.value = dogsJson as DogBreed[];
  avgTraits.value = computeAverageTraits(dogs.value);

  const first = dogs.value[0];
  if (first) selectedName.value = first.name;
});
</script>

<template>
  <div class="home">
    <!-- 上面三块卡片区 -->
    <section class="top">
      <div class="card left">
        <div class="title">Select a dog</div>

        <select v-model="selectedName" class="select">
          <option value="" disabled>Select a breed</option>
          <option v-for="d in dogs" :key="d.name" :value="d.name">
            {{ d.name }}
          </option>
        </select>

        <div class="imgBox">
          <img v-if="selectedDog" :src="selectedDog.image_link" :alt="selectedDog.name" />
          <div v-else class="placeholder">狗的 image</div>
        </div>

        <div v-if="selectedBreedGroup" class="breedGroupTag">
          {{ selectedBreedGroup }}
        </div>

         <button class="compareBtn" :disabled="!selectedDog" @click="sendToCompare">
          Compare
        </button>
      </div>

      <div class="card mid">
        <div class="title">Dog vs human height</div>
        <div class="midBody">
          <HeightCompareChart class="midChart" :dog="selectedDog" />
        </div>
      </div>

      <div class="card right">
        <div class="title">Temperament profile (8 traits)</div>
        <div class="traitArea">
          <TraitLineChart :dog="selectedDog" :avgTraits="avgTraits" />
        </div>
      </div>
    </section>

    <!-- 下方：大 scatter + 右侧列表 -->
    <section class="bottom">
      <div class="card scatter">
        <div class="title">All dogs overview (scatterplot)</div>

        <div class="plotArea">
          <ScatterPlot
            :data="scatterData"
            :highlightId="highlightId"
            :filterEnabled="filterEnabled"
            :traitEnabled="traitEnabled"
            :hasSelectedDog="!!selectedDog"
            :filteredCount="filteredCount"
            :totalCount="totalCount"
            @update:filterEnabled="filterEnabled = $event"
            @toggleTrait="toggleTrait"
            @selectDog="onSelectDog"
          />
        </div>
      </div>

      <div class="card list">
        <div class="listHeader">
          <div class="title">Dog list</div>
          <div class="subtitle">{{ filteredCount }} / {{ totalCount }} breeds</div>
        </div>

        <div class="listBody">
          <button
            v-for="d in listDogs"
            :key="d.name"
            class="row"
            :class="{ active: d.name === selectedName }"
            @click="selectedName = d.name"
          >
            <img :src="d.image_link" :alt="d.name" />
            <div class="name">{{ d.name }}</div>
          </button>

          <div v-if="listDogs.length === 0" class="empty">
            No matching dogs. Try adjusting the trait filters.
          </div>
        </div>
      </div>
    </section>
    <section class="beeswarmSection">
      <div class="card beeswarm">
        <div class="title">Trait distribution (beeswarm)</div>

        <div class="plotArea beeswarmArea">
          <BeeswarmPlot
            :dogs="filteredDogs"
            :traits="beeswarmTraits"
            :traitLabels="traitLabels"
            :highlightId="highlightId"
            @selectDog="onSelectDog"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.top {
  display: grid;
  grid-template-columns: auto 1fr 2fr; /* left=内容宽，mid 左侧对齐 left 右侧，mid 更宽 */
  gap: 12px;
  align-items: stretch;
  height: fit-content;
}

.bottom {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 18px;
  align-items: stretch;
  height: 720px;
}

.card {
  background: #eee;
  border-radius: 10px;
  padding: 12px;
}

.card.mid .title {
  flex: 0 0 auto;
  margin-bottom: 8px;
}
.card.mid {
  display: grid;
  flex-direction: column;
}

.card.right {
  display: grid;
  flex-direction: column;
}

.midBody {
  flex: 1 1 auto;
  min-height: 0; /* 重要：防止 flex 子项计算高度出问题 */
  position: relative;
}

/* [ADDED] 让组件自身高度=100%，它的 bottom:0 才会贴到 midBody 底部 */
.midChart {
  height: 100%;
}

.card.left {
  width: fit-content;
  flex-direction: column;
}

.title {
  font-weight: 600;
  margin-bottom: 10px;
}

.select {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
}

.imgBox {
  margin-top: 10px;
  height: 240px;
  width: 240px;
  border-radius: 10px;
  overflow: hidden;
  background: #ddd;
  display: grid;
  place-items: center;
}
.imgBox img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  opacity: 0.7;
}

.breedGroupTag {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  background: rgb(255, 204, 0);
  font:rgb(255, 255, 255);
}

.traitArea {
  height: 260px;
  width: 100%;
}
.scatter .plotArea {
  height: 660px;
}

.card.list {
  height: 660px; /* 高度固定不变 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.listHeader {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.subtitle {
  font-size: 12px;
  opacity: 0.75;
  color: #6b7280;
}

.listBody {
  flex: 1 1 auto;
  overflow-y: auto; /* 下拉滚动 */
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 6px;
  padding-bottom: 4px;
}

.listBody::-webkit-scrollbar {
  width: 6px;
}

.listBody::-webkit-scrollbar-track {
  background: transparent;
}

.listBody::-webkit-scrollbar-thumb {
  background: rgba(206, 214, 225, 0.6);
  border-radius: 999px;
}

.listBody::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.85);
}

.row {
  position: relative;
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border: 0;
  background: #ffffff;
  border-radius: 30px;
  cursor: pointer;
  transition:
    background 0.16s ease,
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.row::after {
  content: "›";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: #acaf9c;
}

.row:hover {
  background: #fff8e5;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
}

/* 选中高亮 */
.row.active {
  background: #ffdf5d;
}

/* 可选：让选中的更“像选中”一点 */
.row.active .name {
  font-weight: 700;
}

.row img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.6);
}

.name {
  text-align: left;
  font-size: 13px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 12px; /* 为右侧箭头留出空间 */
}

.empty {
  opacity: 0.8;
  font-size: 12px;
  padding: 10px;
  border-radius: 10px;
  background: #eef2ff;
  color: #6b7280;
}
.beeswarmSection {
  height: 700px;
}

.card.beeswarm {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.beeswarmArea {
  flex: 1 1 auto;
  min-height: 620px;
}
</style>
