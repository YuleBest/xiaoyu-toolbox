<template>
  <ToolContainer id="json-yaml">
    <div class="h-100 d-flex flex-column">
      <!-- Controls -->
      <v-card variant="flat" class="mb-4">
        <v-card-text class="d-flex align-center flex-wrap gap-2">
          <v-btn
            color="primary"
            prepend-icon="mdi-arrow-right-bold"
            @click="convertJsonToYaml"
          >
            JSON 转 YAML
          </v-btn>
          <v-btn
            color="secondary"
            prepend-icon="mdi-arrow-left-bold"
            @click="convertYamlToJson"
          >
            YAML 转 JSON
          </v-btn>
          <v-divider vertical class="mx-2"></v-divider>
          <v-btn
            variant="text"
            @click="clearAll"
            prepend-icon="mdi-delete-outline"
          >
            清空
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Editors -->
      <v-row class="flex-grow-1" no-gutters>
        <!-- JSON Input -->
        <v-col
          cols="12"
          md="6"
          class="h-100 d-flex flex-column pr-md-2 pb-4 pb-md-0"
        >
          <v-card class="flex-grow-1 d-flex flex-column" border variant="flat">
            <v-card-title
              class="py-3 px-4 text-subtitle-2 font-weight-bold d-flex align-center border-b"
            >
              <span>JSON</span>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                size="small"
                icon="mdi-content-copy"
                @click="copy(jsonContent)"
                title="复制 JSON"
              ></v-btn>
            </v-card-title>
            <v-textarea
              v-model="jsonContent"
              class="flex-grow-1 font-monospace"
              variant="solo"
              flat
              hide-details
              no-resize
              placeholder='{"key": "value"}'
              spellcheck="false"
            ></v-textarea>
          </v-card>
        </v-col>

        <!-- YAML Input -->
        <v-col cols="12" md="6" class="h-100 d-flex flex-column pl-md-2">
          <v-card class="flex-grow-1 d-flex flex-column" border variant="flat">
            <v-card-title
              class="py-3 px-4 text-subtitle-2 font-weight-bold d-flex align-center border-b"
            >
              <span>YAML</span>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                size="small"
                icon="mdi-content-copy"
                @click="copy(yamlContent)"
                title="复制 YAML"
              ></v-btn>
            </v-card-title>
            <v-textarea
              v-model="yamlContent"
              class="flex-grow-1 font-monospace"
              variant="solo"
              flat
              hide-details
              no-resize
              placeholder="key: value"
              spellcheck="false"
            ></v-textarea>
          </v-card>
        </v-col>
      </v-row>

      <v-snackbar v-model="snackbar" :color="snackbarColor" location="top">
        {{ snackbarText }}
      </v-snackbar>
    </div>
  </ToolContainer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import ToolContainer from "@/components/ToolContainer.vue";
import yaml from "js-yaml";

const jsonContent = ref("");
const yamlContent = ref("");
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

const convertJsonToYaml = () => {
  if (!jsonContent.value.trim()) return;
  try {
    const obj = JSON.parse(jsonContent.value);
    yamlContent.value = yaml.dump(obj);
    showSnackbar("转换成功", "success");
  } catch (e: any) {
    showSnackbar(`JSON 解析错误: ${e.message}`, "error");
  }
};

const convertYamlToJson = () => {
  if (!yamlContent.value.trim()) return;
  try {
    const obj = yaml.load(yamlContent.value);
    jsonContent.value = JSON.stringify(obj, null, 2);
    showSnackbar("转换成功", "success");
  } catch (e: any) {
    showSnackbar(`YAML 解析错误: ${e.message}`, "error");
  }
};

const clearAll = () => {
  jsonContent.value = "";
  yamlContent.value = "";
};

const copy = (text: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  showSnackbar("已复制到剪贴板", "success");
};

const showSnackbar = (text: string, color: string) => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};
</script>

<style scoped>
.font-monospace :deep(textarea) {
  font-family: "JetBrains Mono", "Fira Code", monospace !important;
  font-size: 0.875rem;
  line-height: 1.5;
}

.gap-2 {
  gap: 8px;
}
</style>
