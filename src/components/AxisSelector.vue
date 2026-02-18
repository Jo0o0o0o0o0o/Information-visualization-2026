<script setup lang="ts">
import { computed, ref } from "vue";
import type { RadarKey } from "@/d3Viz/createRadarChart";

export type AxisItem = {
  key: RadarKey;
  label: string;
};

const props = defineProps<{
  allAxes: AxisItem[];
  activeAxes: AxisItem[];
}>();

const emit = defineEmits<{
  (e: "update:activeAxes", axes: AxisItem[]): void;
}>();

const axisToAdd = ref<string>("");

const remainingAxes = computed(() => {
  const set = new Set(props.activeAxes.map(a => a.key));
  return props.allAxes.filter(a => !set.has(a.key));
});

function removeAxis(key: string) {
  if (props.activeAxes.length <= 3) return; // 最少保留3个
  const next = props.activeAxes.filter(a => a.key !== key);
  emit("update:activeAxes", next);
}

function addAxis() {
  if (!axisToAdd.value) return;
  const found = props.allAxes.find(a => a.key === axisToAdd.value);
  if (!found) return;
  emit("update:activeAxes", [...props.activeAxes, found]);
  axisToAdd.value = "";
}
</script>

<template>
  <div class="axisPanel">
    <div class="chips">
      <button
        v-for="a in activeAxes"
        :key="a.key"
        class="chip"
        @click="removeAxis(a.key)"
      >
        {{ a.label }} <span class="x">×</span>
      </button>
    </div>

    <div class="addRow">
      <select v-model="axisToAdd" class="axisSelect">
        <option value="" disabled>添加维度...</option>
        <option
          v-for="a in remainingAxes"
          :key="a.key"
          :value="a.key"
        >
          {{ a.label }}
        </option>
      </select>

      <button
        class="addBtn"
        @click="addAxis"
        :disabled="!axisToAdd"
      >
        Add
      </button>
    </div>
  </div>
</template>

<style scoped>
.axisPanel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: 1px solid rgba(0,0,0,0.14);
  background: white;
  border-radius: 999px;
  padding: 6px 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.chip .x {
  opacity: 0.6;
  font-size: 14px;
}

.addRow {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.axisSelect {
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.18);
  padding: 0 10px;
  background: white;
}

.addBtn {
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.18);
  padding: 0 12px;
  background: #fafafa;
  cursor: pointer;
}

.addBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
