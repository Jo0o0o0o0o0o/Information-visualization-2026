<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

type SectionItem = {
  id: string;
  title: string;
};

const sections: SectionItem[] = [
  { id: "project-overview", title: "Project Overview" },
  { id: "how-to-use", title: "How To Use" },
  { id: "data", title: "Data" },
  { id: "resources", title: "Project Resources" },
];

const activeSection = ref<string>(sections[0]?.id ?? "");
let observer: IntersectionObserver | null = null;

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  activeSection.value = id;
  history.replaceState(null, "", `#${id}`);
}

onMounted(() => {
  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && sections.some((s) => s.id === initialHash)) {
    scrollToSection(initialHash);
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      activeSection.value = visible.target.id;
    },
    {
      root: null,
      rootMargin: "-90px 0px -55% 0px",
      threshold: [0.2, 0.4, 0.7],
    },
  );

  sections.forEach((section) => {
    const el = document.getElementById(section.id);
    if (el) observer?.observe(el);
  });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <div class="aboutPage">
    <aside class="sidebar">
      <button
        v-for="section in sections"
        :key="section.id"
        type="button"
        class="navBtn"
        :class="{ active: activeSection === section.id }"
        @click="scrollToSection(section.id)"
      >
        {{ section.title }}
      </button>
    </aside>

    <section class="content">
      <article
        v-for="section in sections"
        :id="section.id"
        :key="`content-${section.id}`"
        class="sectionBlock"
      >
        <h2>{{ section.title }}</h2>
        <div class="placeholder"></div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.aboutPage {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.sidebar {
  position: sticky;
  top: 84px;
  display: grid;
  gap: 10px;
}

.navBtn {
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #fff8d8;
  color: #4a3b00;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.navBtn:hover {
  background: #fff2b3;
}

.navBtn.active {
  background: #ffd84f;
}

.content {
  min-width: 0;
  display: grid;
  gap: 16px;
}

.sectionBlock {
  scroll-margin-top: 96px;
  border: none;
  background: #fffef7;
  border-radius: 12px;
  padding: 18px 20px 22px;
}

.sectionBlock h2 {
  margin: 0 0 12px;
  font-size: 34px;
  line-height: 1.1;
  color: #2d2500;
}

.placeholder {
  height: 280px;
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgba(255, 230, 120, 0.08), rgba(255, 223, 58, 0.04)),
    #fffdf3;
}

@media (max-width: 980px) {
  .aboutPage {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
