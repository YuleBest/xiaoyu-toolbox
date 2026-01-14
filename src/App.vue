<template>
  <v-app>
    <v-app-bar elevation="0" color="background" class="border-b">
      <v-app-bar-title class="font-weight-bold text-primary"
        >小于工具箱</v-app-bar-title
      >
      <v-spacer></v-spacer>
      <v-btn
        icon="mdi-github"
        href="https://github.com/YuleBest/xiaoyu-toolbox"
        target="_blank"
      ></v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="fill-height align-start pa-0">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" class="w-100" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const drawer = ref(false);
</script>

<style>
/* Global aesthetic improvements */
html {
  overflow-y: auto;
}
</style>
