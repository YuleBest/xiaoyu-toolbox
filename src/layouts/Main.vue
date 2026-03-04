<script setup lang="ts">
import { computed } from 'vue'
import { navigationStore } from '@/stores/navigation'
import Sidebar from '@/components/layout/Sidebar.vue'
import MobileNav from '@/components/layout/MobileNav.vue'
import Footer from '@/components/layout/Footer.vue'
import BackButton from '@/components/layout/BackButton.vue'
import UpdateLog from '@/components/UpdateLog.vue'

const isCollapsed = computed(() => navigationStore.isCollapsed)
</script>

<template>
  <div
    class="flex min-h-screen w-full bg-background no-scrollbar selection:bg-blue-500/10 transition-colors duration-300"
  >
    <!-- Back Button -->
    <BackButton />

    <!-- Desktop Sidebar -->
    <Sidebar />

    <!-- Mobile Navigation -->
    <MobileNav />

    <!-- Main Content Area -->
    <main
      class="flex-1 min-h-screen pt-16 md:pt-0 no-scrollbar overflow-x-hidden transition-all duration-300"
      :class="[isCollapsed ? 'md:ml-[80px]' : 'md:ml-64']"
    >
      <div
        class="flex flex-col min-h-screen p-6 md:px-14 md:py-8 lg:px-20 lg:py-10 max-w-7xl mx-auto"
      >
        <div class="flex-1 min-h-[60vh]">
          <slot />
          <UpdateLog />
        </div>
        <Footer />
      </div>
    </main>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
