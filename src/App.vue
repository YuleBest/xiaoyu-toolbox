<template>
  <v-app :theme="theme">
    <v-app-bar elevation="0" color="surface" class="border-b">
      <v-app-bar-title class="font-weight-bold text-primary">
        小于工具箱
      </v-app-bar-title>
      <v-spacer></v-spacer>

      <v-btn
        :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        @click="toggleTheme"
        variant="text"
      ></v-btn>

      <v-btn icon="mdi-home" to="/" variant="text"></v-btn>
      <v-btn
        icon="mdi-github"
        href="https://github.com/YuleBest/xiaoyu-toolbox"
        target="_blank"
        variant="text"
      ></v-btn>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container fluid class="pa-0 fill-height align-start">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" class="w-100" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>

    <v-footer color="surface" class="border-t py-6">
      <v-container>
        <v-row no-gutters align="center">
          <v-col cols="12" sm="6" class="text-center text-sm-left">
            <div class="text-h6 font-weight-bold ml-n1 mb-1 text-primary">
              <v-icon icon="mdi-toolbox" class="mr-2"></v-icon>小于工具箱
            </div>
            <div class="text-body-2 text-medium-emphasis">
              高效、简单、纯净的在线工具集
            </div>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            class="text-center text-sm-right mt-4 mt-sm-0"
          >
            <div class="text-body-2 text-medium-emphasis mb-2">
              © {{ new Date().getFullYear() }} Yule. Built with Vue & Vuetify.
            </div>
            <div class="d-flex justify-center justify-sm-end gap-2">
              <v-btn variant="text" size="small" to="/tools">所有工具</v-btn>
              <v-btn
                variant="text"
                size="small"
                href="https://github.com/YuleBest"
                target="_blank"
                >作者 GitHub</v-btn
              >
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";

const theme = ref("light");

const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
  localStorage.setItem("theme", theme.value);
};

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    theme.value = savedTheme;
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    theme.value = "dark";
  }
});
</script>

<style>
/* Global aesthetic improvements */
html {
  overflow-y: auto !important;
}

.gap-2 {
  gap: 8px;
}

/* Ensure footer stays at bottom */
.v-application__wrap {
  min-height: 100vh;
}
</style>
