<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center" class="text-center">
      <v-col cols="12" md="8" lg="6">
        <v-icon
          icon="mdi-toolbox"
          size="120"
          color="primary"
          class="mb-6 animate-bounce"
        ></v-icon>

        <h2 class="text-h3 font-weight-bold mb-4 text-primary">小于工具箱</h2>

        <p class="text text-medium-emphasis mb-8">
          简单、高效、现代化的在线工具集
        </p>

        <div class="d-flex justify-center gap-4">
          <v-btn
            color="primary"
            size="x-large"
            to="/tools"
            prepend-icon="mdi-rocket-launch"
            elevation="4"
          >
            开始使用
          </v-btn>

          <v-btn
            variant="outlined"
            size="x-large"
            href="https://github.com/YuleBest"
            target="_blank"
            prepend-icon="mdi-github"
            class="ml-4"
          >
            GitHub
          </v-btn>
        </div>

        <div class="mt-16 d-flex justify-center gap-8 text-medium-emphasis">
          <div class="d-flex align-center">
            <v-icon
              icon="mdi-check-circle-outline"
              class="mr-2"
              color="success"
            ></v-icon>
            <span class="text-body-2">完全免费</span>
          </div>
          <div class="d-flex align-center">
            <v-icon
              icon="mdi-shield-check-outline"
              class="mr-2"
              color="info"
            ></v-icon>
            <span class="text-body-2">无后台记录</span>
          </div>
          <div class="d-flex align-center">
            <v-icon
              icon="mdi-lightning-bolt-outline"
              class="mr-2"
              color="warning"
            ></v-icon>
            <span class="text-body-2">极速响应</span>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.gap-4 {
  gap: 16px;
}
.gap-8 {
  gap: 32px;
}
</style>
