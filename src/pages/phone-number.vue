<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Search, MapPin, Building2, Wifi, Phone, X } from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import { lookupPhoneNumber, type PhoneNumberResult } from "@/api/phoneNumber";

const { t } = useI18n();
const tool = allTools.find((t) => t.id === "phone-number")!;

const phoneInput = ref("");
const loading = ref(false);
const result = ref<PhoneNumberResult | null>(null);
const hasQueried = ref(false);
const errorMsg = ref("");

const history = ref<{ phone: string; result: PhoneNumberResult }[]>([]);

// 从 sessionStorage 恢复历史
try {
  const saved = sessionStorage.getItem("phone-number-history");
  if (saved) history.value = JSON.parse(saved);
} catch {
  /* ignore */
}

const saveHistory = () => {
  try {
    sessionStorage.setItem(
      "phone-number-history",
      JSON.stringify(history.value),
    );
  } catch {
    /* ignore */
  }
};

const formattedPhone = computed(() => {
  const cleaned = phoneInput.value.replace(/[\s\-+]/g, "").replace(/^86/, "");
  if (cleaned.length > 7) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length > 3) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return cleaned;
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch(phoneInput, (newVal) => {
  const cleaned = newVal.replace(/[\s\-+]/g, "").replace(/^86/, "");
  if (cleaned.length >= 7) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      doQuery();
    }, 400);
  } else {
    if (debounceTimer) clearTimeout(debounceTimer);
    result.value = null;
    errorMsg.value = "";
    hasQueried.value = false;
  }
});

const doQuery = async () => {
  const cleaned = phoneInput.value.replace(/[\s\-+]/g, "").replace(/^86/, "");
  if (cleaned.length < 7) return;

  loading.value = true;
  errorMsg.value = "";
  result.value = null;
  hasQueried.value = true;

  try {
    const res = await lookupPhoneNumber(cleaned);
    result.value = res;

    if (!res) {
      errorMsg.value = t("phoneNumber.notFound");
    } else {
      if (cleaned.length === 11) {
        // 去重添加到历史
        history.value = [
          { phone: cleaned, result: res },
          ...history.value.filter((h) => h.phone !== cleaned),
        ].slice(0, 20);
        saveHistory();
      }
    }
  } catch {
    errorMsg.value = t("phoneNumber.queryFailed");
  } finally {
    loading.value = false;
  }
};

const queryFromHistory = (phone: string) => {
  phoneInput.value = phone;
  doQuery();
};

const clearHistory = () => {
  history.value = [];
  sessionStorage.removeItem("phone-number-history");
};
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Input Card -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-8">
        <div class="flex gap-3">
          <div class="relative flex-1 min-w-0">
            <Phone
              class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <input
              v-model="phoneInput"
              type="tel"
              maxlength="20"
              :placeholder="t('phoneNumber.inputPlaceholder')"
              class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-mono"
              @keyup.enter="doQuery"
            />
          </div>
          <button
            @click="doQuery"
            :disabled="loading || !phoneInput.trim()"
            class="px-5 py-3 rounded-2xl bg-blue-500 text-white font-medium hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
          >
            <Search class="h-4 w-4" />
            {{ t("phoneNumber.query") }}
          </button>
        </div>
      </div>

      <!-- Result Card -->
      <div
        v-if="hasQueried && !loading && result"
        class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <div class="text-center mb-5">
          <div class="text-2xl font-mono font-bold tracking-widest">
            {{ formattedPhone }}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            class="bg-card border border-muted/60 rounded-xl p-4 flex items-center gap-3"
          >
            <div
              class="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"
            >
              <MapPin class="h-4.5 w-4.5 text-blue-500" />
            </div>
            <div class="min-w-0">
              <div class="text-xs text-muted-foreground font-medium">
                {{ t("phoneNumber.province") }}
              </div>
              <div class="text-sm font-bold truncate">
                {{ result.province }}
              </div>
            </div>
          </div>

          <div
            class="bg-card border border-muted/60 rounded-xl p-4 flex items-center gap-3"
          >
            <div
              class="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"
            >
              <Building2 class="h-4.5 w-4.5 text-emerald-500" />
            </div>
            <div class="min-w-0">
              <div class="text-xs text-muted-foreground font-medium">
                {{ t("phoneNumber.city") }}
              </div>
              <div class="text-sm font-bold truncate">
                {{ result.city }}
              </div>
            </div>
          </div>

          <div
            class="bg-card border border-muted/60 rounded-xl p-4 flex items-center gap-3"
          >
            <div
              class="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0"
            >
              <Wifi class="h-4.5 w-4.5 text-amber-500" />
            </div>
            <div class="min-w-0">
              <div class="text-xs text-muted-foreground font-medium">
                {{ t("phoneNumber.isp") }}
              </div>
              <div class="text-sm font-bold truncate">
                {{ result.isp }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="bg-card/30 border border-muted/80 rounded-3xl p-12 flex items-center justify-center"
      >
        <div class="css-spinner" />
      </div>

      <!-- Error / Not Found State -->
      <div
        v-if="hasQueried && !loading && errorMsg"
        class="bg-card/30 border border-muted/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-3"
      >
        <div
          class="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-2"
        >
          <Search class="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
        <p class="text-lg font-medium text-foreground">{{ errorMsg }}</p>
        <p class="text-sm text-muted-foreground">
          {{ t("phoneNumber.checkInput") }}
        </p>
      </div>

      <!-- History -->
      <div
        v-if="history.length > 0"
        class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-8"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-muted-foreground">
            {{ t("phoneNumber.history") }}
          </h3>
          <button
            @click="clearHistory"
            class="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X class="h-3 w-3" />
            {{ t("common.clearAll") }}
          </button>
        </div>
        <div class="space-y-2">
          <button
            v-for="item in history"
            :key="item.phone"
            @click="queryFromHistory(item.phone)"
            class="w-full flex items-center justify-between bg-card border border-muted/60 rounded-xl px-4 py-3 hover:border-blue-500/30 hover:bg-muted/30 transition-all text-left cursor-pointer group"
          >
            <span class="font-mono text-sm font-bold">
              {{ item.phone.slice(0, 3) }} {{ item.phone.slice(3, 7) }}
              {{ item.phone.slice(7) }}
            </span>
            <span
              class="text-xs text-muted-foreground group-hover:text-foreground transition-colors"
            >
              {{ item.result.province }} · {{ item.result.city }} ·
              {{ item.result.isp }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
