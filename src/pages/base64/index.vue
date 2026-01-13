<template>
  <ToolContainer id="base64">
    <div class="h-100 d-flex flex-column">
      <v-row class="flex-grow-1 ma-0">
        <v-col cols="12" md="6" class="h-100 d-flex flex-column pa-2">
          <v-card class="flex-grow-1 d-flex flex-column" border variant="flat">
            <v-card-title
              class="py-3 px-4 bg-grey-lighten-4 text-subtitle-2 font-weight-bold d-flex align-center border-b"
            >
              <span>原文 (Text)</span>
              <v-spacer></v-spacer>
              <v-btn
                size="small"
                variant="text"
                icon="mdi-content-copy"
                @click="copy(decodedText)"
                title="复制"
              ></v-btn>
              <v-btn
                size="small"
                variant="text"
                icon="mdi-close"
                @click="clear"
                title="清空"
              ></v-btn>
            </v-card-title>
            <v-textarea
              v-model="decodedText"
              placeholder="请输入要编码的文本..."
              variant="solo"
              flat
              hide-details
              class="flex-grow-1 pa-0 custom-textarea h-100"
              no-resize
              @input="encode"
            ></v-textarea>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" class="h-100 d-flex flex-column pa-2">
          <v-card class="flex-grow-1 d-flex flex-column" border variant="flat">
            <v-card-title
              class="py-3 px-4 bg-grey-lighten-4 text-subtitle-2 font-weight-bold d-flex align-center border-b"
            >
              <span>Base64</span>
              <v-spacer></v-spacer>
              <v-btn
                size="small"
                variant="text"
                icon="mdi-content-copy"
                @click="copy(encodedText)"
                title="复制"
              ></v-btn>
              <v-btn
                size="small"
                variant="text"
                icon="mdi-close"
                @click="clear"
                title="清空"
              ></v-btn>
            </v-card-title>
            <v-textarea
              v-model="encodedText"
              placeholder="输入 Base64 进行解码..."
              variant="solo"
              flat
              hide-details
              class="flex-grow-1 pa-0 custom-textarea h-100"
              no-resize
              @input="decode"
            ></v-textarea>
          </v-card>
        </v-col>
      </v-row>

      <v-snackbar
        v-model="snackbar"
        location="top"
        :color="snackbarColor"
        timeout="2000"
      >
        {{ snackbarText }}
      </v-snackbar>
    </div>
  </ToolContainer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import ToolContainer from "@/components/ToolContainer.vue";

const decodedText = ref("");
const encodedText = ref("");
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("");

// UTF-8 friendly Base64 Encode
const encode = () => {
  try {
    if (!decodedText.value) {
      encodedText.value = "";
      return;
    }
    encodedText.value = window.btoa(
      encodeURIComponent(decodedText.value).replace(
        /%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode(parseInt(p1, 16));
        }
      )
    );
  } catch (e) {
    console.error(e);
  }
};

// UTF-8 friendly Base64 Decode
const decode = () => {
  try {
    if (!encodedText.value) {
      decodedText.value = "";
      return;
    }
    decodedText.value = decodeURIComponent(
      window
        .atob(encodedText.value)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  } catch (e) {
    // Don't clear or show error immediately on typing incomplete base64
  }
};

const clear = () => {
  decodedText.value = "";
  encodedText.value = "";
};

const copy = (text: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  snackbarText.value = "已复制";
  snackbarColor.value = "success";
  snackbar.value = true;
};
</script>

<style scoped>
:deep(.custom-textarea .v-field) {
  height: 100%;
  border-radius: 0;
}
:deep(.custom-textarea textarea) {
  height: 100% !important;
  padding: 16px;
}
</style>
