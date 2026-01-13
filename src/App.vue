<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" color="surface-variant" temporary>
      <v-list>
        <v-list-item title="小于工具箱" subtitle="实用工具合集"></v-list-item>
        <v-divider></v-divider>
        <v-list-item
          link
          to="/"
          title="首页"
          prepend-icon="mdi-home"
        ></v-list-item>
        <v-list-item
          link
          to="/qrcode"
          title="二维码工具"
          prepend-icon="mdi-qrcode"
        ></v-list-item>
        <v-list-item
          link
          to="/base64"
          title="Base64 转换"
          prepend-icon="mdi-code-tags"
        ></v-list-item>
        <v-list-item
          link
          to="/dydown"
          title="抖音视频解析"
          prepend-icon="mdi-video"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar elevation="0" color="background" class="border-b">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title class="font-weight-bold text-primary"
        >小于工具箱</v-app-bar-title
      >
      <v-spacer></v-spacer>
      <v-btn
        icon="mdi-github"
        href="https://github.com/YuleBest"
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
