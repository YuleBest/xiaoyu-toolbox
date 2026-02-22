<script setup lang="ts">
import { ref, inject } from "vue";
import { useI18n } from "vue-i18n";
import { Search, Plus, Send } from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import { guessHhsh, submitTranslation, type GuessResult } from "@/api/hhsh";

const { t } = useI18n();

const showToast = inject("showToast") as (
  msg: string,
  type?: "success" | "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "hhsh")!;

const inputText = ref("");
const results = ref<GuessResult[]>([]);
const loading = ref(false);
const searched = ref(false);

const submitForm = ref({ name: "", text: "" });
const submitting = ref(false);
const showSubmit = ref<string | null>(null);

const handleQuery = async () => {
  const originalText = inputText.value.trim();
  if (!originalText) {
    results.value = [];
    searched.value = false;
    return;
  }

  // Match English letter sequences of length 2 to 14
  const matches = originalText.match(/[a-zA-Z]{2,14}/g);
  if (!matches || matches.length === 0) {
    showToast(t("hhsh.noResults"), "warning");
    results.value = [];
    searched.value = true;
    return;
  }

  // Deduplicate and join with comma
  const uniqueMatches = Array.from(new Set(matches));
  const text = uniqueMatches.join(",");

  loading.value = true;
  searched.value = true;
  showSubmit.value = null; // Close any open submit forms

  try {
    const data = await guessHhsh(text);
    results.value = data || [];
    if (results.value.length === 0) {
      // API might return empty array if format matches nothing at all
      showToast(t("hhsh.noResults"), "warning");
    }
  } catch (e: any) {
    console.error(e);
    showToast(t("hhsh.noResults"), "error");
    results.value = [];
  } finally {
    loading.value = false;
  }
};

const openSubmit = (name: string) => {
  if (showSubmit.value === name) {
    showSubmit.value = null; // Toggle
    return;
  }
  showSubmit.value = name;
  submitForm.value = { name, text: "" };
};

const handleSubmit = async () => {
  const { name, text } = submitForm.value;
  if (!text.trim()) return;

  submitting.value = true;
  try {
    await submitTranslation(name, text.trim());
    showToast(t("hhsh.submitSuccess"), "success");
    showSubmit.value = null;
  } catch (e: any) {
    console.error(e);
    showToast(t("hhsh.submitError"), "error");
  } finally {
    submitting.value = false;
  }
};

const expandedCards = ref(new Set<string>());

const toggleExpand = (name: string) => {
  if (expandedCards.value.has(name)) {
    expandedCards.value.delete(name);
  } else {
    expandedCards.value.add(name);
  }
};

const getContextSnippet = (word: string, fullText: string) => {
  if (!fullText) return "";
  const index = fullText.indexOf(word);
  if (index === -1) return "";

  const start = Math.max(0, index - 5);
  const end = Math.min(fullText.length, index + word.length + 5);

  let prefix = start > 0 ? "..." : "";
  let suffix = end < fullText.length ? "..." : "";

  const before = fullText.substring(start, index);
  const after = fullText.substring(index + word.length, end);

  return `(${prefix}${before}<span class="text-red-500 font-bold">${word}</span>${after}${suffix})`;
};
</script>

<template>
  <ToolContainer :tool="tool">
    <div
      class="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pt-4"
    >
      <!-- Search Input Section -->
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div class="relative flex-1 group">
          <div
            class="absolute inset-y-0 left-4 flex items-center pointer-events-none"
          >
            <Search
              class="h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors"
            />
          </div>
          <input
            v-model="inputText"
            type="text"
            :placeholder="t('hhsh.inputPlaceholder')"
            @keyup.enter="handleQuery"
            class="w-full pl-12 pr-4 py-4 bg-card/50 border-2 border-muted/60 focus:border-blue-500/50 focus:bg-card/80 rounded-2xl outline-none transition-all text-base shadow-none"
            :disabled="loading"
          />
        </div>
        <button
          @click="handleQuery"
          :disabled="loading || !inputText.trim()"
          class="flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 text-white font-medium rounded-2xl hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <div
            v-if="loading"
            class="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></div>
          <span v-else>{{ t("hhsh.query") }}</span>
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-if="searched && !loading && results.length === 0"
        class="bg-card/30 border border-muted/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-3"
      >
        <div
          class="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-2"
        >
          <Search class="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
        <p class="text-lg font-medium text-foreground">
          {{ t("hhsh.noResults") }}
        </p>
      </div>

      <!-- Results Grid -->
      <div
        v-if="results.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div
          v-for="item in results"
          :key="item.name"
          class="bg-card/40 border-2 border-muted/40 hover:border-blue-500/30 rounded-3xl p-6 transition-all space-y-5"
        >
          <!-- Head: Name & Quick Action -->
          <div class="flex items-start justify-between gap-4">
            <h3
              class="text-2xl font-semibold text-foreground tracking-tight break-all flex items-baseline gap-2 flex-wrap"
            >
              <span>{{ item.name }}</span>
              <span
                class="text-xs font-normal text-muted-foreground"
                v-html="getContextSnippet(item.name, inputText)"
              ></span>
            </h3>
            <button
              @click="openSubmit(item.name)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-xl text-sm font-medium transition-all active:scale-95 shrink-0"
            >
              <Plus class="w-4 h-4" />
              <span class="hidden sm:inline">{{ t("hhsh.submitNew") }}</span>
            </button>
          </div>

          <!-- Main Translation Labels -->
          <div class="space-y-2">
            <div
              v-if="item.trans && item.trans.length > 0"
              class="flex flex-wrap gap-2"
            >
              <span
                v-for="tr in expandedCards.has(item.name)
                  ? item.trans
                  : item.trans.slice(0, 10)"
                :key="tr"
                class="px-3 py-1.5 border border-muted/80 rounded-xl text-[15px] font-medium text-foreground"
              >
                {{ tr }}
              </span>

              <button
                v-if="item.trans.length > 10"
                @click="toggleExpand(item.name)"
                class="px-3 py-1.5 border border-transparent hover:bg-muted/50 rounded-xl text-[13px] font-medium text-blue-500 flex items-center gap-1 transition-colors"
              >
                {{
                  expandedCards.has(item.name)
                    ? "收起"
                    : `展开更多 (${item.trans.length - 10})`
                }}
              </button>
            </div>
            <div
              v-else
              class="text-sm text-muted-foreground italic bg-muted/30 px-3 py-2 rounded-xl inline-block"
            >
              {{ t("hhsh.noResults") }}
            </div>
          </div>

          <!-- Inputting / Candidates -->
          <div
            v-if="item.inputting && item.inputting.length > 0"
            class="space-y-2"
          >
            <p
              class="text-[11px] font-semibold text-muted-foreground uppercase opacity-70"
            >
              {{ t("hhsh.inputtingLabel") }}
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="inp in item.inputting"
                :key="inp"
                class="px-2 py-1 bg-secondary/60 text-secondary-foreground text-xs rounded-lg"
              >
                {{ inp }}
              </span>
            </div>
          </div>

          <!-- Submit New Description Form (Collapsible) -->
          <div
            v-if="showSubmit === item.name"
            class="mt-4 pt-4 border-t border-muted/50 animate-in slide-in-from-top-2 fade-in duration-200"
          >
            <div
              class="space-y-3 p-4 bg-muted/20 border border-muted/50 rounded-2xl"
            >
              <p class="text-sm">
                {{ t("hhsh.submitPrefix") }}
                <span class="font-bold text-blue-500 mx-1">{{
                  item.name
                }}</span>
                {{ t("hhsh.submitNew") }}
              </p>
              <div class="flex flex-col sm:flex-row gap-2">
                <input
                  v-model="submitForm.text"
                  type="text"
                  :placeholder="t('hhsh.submitPlaceholder')"
                  @keyup.enter="handleSubmit"
                  class="flex-1 px-3 py-2 bg-background border border-muted focus:border-blue-500 rounded-xl outline-none text-sm transition-all"
                  :disabled="submitting"
                />
                <button
                  @click="handleSubmit"
                  :disabled="submitting || !submitForm.text.trim()"
                  class="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <Send class="w-3.5 h-3.5" v-if="!submitting" />
                  <div
                    v-else
                    class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
                  ></div>
                  {{ submitting ? t("hhsh.submitting") : t("hhsh.submit") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
