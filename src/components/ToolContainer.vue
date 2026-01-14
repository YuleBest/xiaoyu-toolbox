<template>
  <div class="d-flex flex-column h-100 w-100">
    <!-- Top Bar -->
    <v-toolbar
      color="surface"
      density="comfortable"
      class="border-b pl-2 pr-2 flex-shrink-0"
    >
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        @click="router.back()"
      ></v-btn>
      <v-toolbar-title class="text-subtitle-2 font-weight-bold">
        <v-icon
          :icon="tool?.icon"
          :color="tool?.color"
          size="small"
          class="mr-2"
        ></v-icon>
        {{ tool?.title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        icon="mdi-information-outline"
        variant="text"
        @click="showInfo = !showInfo"
        :color="showInfo ? 'primary' : ''"
      ></v-btn>
    </v-toolbar>

    <!-- Content Area -->
    <!-- Responsive Container -->
    <div class="responsive-container d-flex bg-background">
      <!-- Main Tool -->
      <main class="responsive-main pa-4">
        <slot></slot>
      </main>

      <!-- Info Sidebar -->
      <aside v-if="showInfo" class="responsive-aside bg-surface pa-4">
        <div class="mb-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">简介</h3>
          <p class="text-body-2 text-medium-emphasis">
            {{ tool?.description }}
          </p>
        </div>

        <v-divider class="mb-4"></v-divider>

        <div class="mb-6">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">用法</h3>
          <div
            class="text-body-2 text-medium-emphasis"
            style="white-space: pre-line"
          >
            {{ tool?.usage }}
          </div>
        </div>

        <v-divider class="mb-4"></v-divider>

        <div class="d-flex align-center">
          <span class="text-caption text-disabled mr-2">作者:</span>
          <v-chip size="small">{{ tool?.author }}</v-chip>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import toolsData from "@/assets/data/tools.json";

const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const showInfo = ref(true);

const tool = computed(() => {
  return toolsData.find((t) => t.id === props.id);
});
</script>

<style scoped>
/* Mobile First / Fallback */
.responsive-container {
  flex-direction: column;
  flex: 1;
  overflow-y: auto; /* Whole area scrolls on mobile */
  height: 100%;
}

.responsive-main {
  flex: 0 0 auto; /* Natural height */
  min-height: 50vh; /* Ensure tool has space */
  order: 2; /* Content below info on mobile */
}

.responsive-aside {
  width: 100%;
  flex: 0 0 auto;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  order: 1; /* Info on top on mobile */
}

/* Desktop (> 960px) */
@media (min-width: 960px) {
  .responsive-container {
    flex-direction: row;
    overflow: hidden; /* Use internal scrolling for desktop */
  }

  .responsive-main {
    flex: 1 1 auto;
    height: 100%;
    overflow-y: auto;
    order: 1; /* Content on left */
  }

  .responsive-aside {
    width: 300px;
    height: 100%;
    overflow-y: auto;
    border-top: none;
    border-bottom: none;
    border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    flex-shrink: 0;
    order: 2; /* Info on right */
  }
}
</style>
