<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  ArrowRightLeft,
  Loader2,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  ChevronDown,
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import { inject } from "vue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const { t } = useI18n();
const showToast = inject("showToast") as (
  msg: string,
  type?: "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "translator-ai")!;

const sourceText = ref("");
const targetText = ref("");
const sourceLangDetected = ref("");
const sourceLangSelected = ref("auto");
const targetLang = ref("en");
const detector = ref<any>(null);
const translator = ref<any>(null);
const isSupported = ref(true);
const isDetecting = ref(false);
const isTranslating = ref(false);
const downloadProgress = ref(0);
const isDownloading = ref(false);
const copiedSource = ref(false);
const copiedTarget = ref(false);

const languages = [
  { code: "zh", name: t("translatorAi.languages.zh") },
  { code: "zh-Hant", name: t("translatorAi.languages.zh-Hant") },
  { code: "en", name: t("translatorAi.languages.en") },
  { code: "ja", name: t("translatorAi.languages.ja") },
  { code: "fr", name: t("translatorAi.languages.fr") },
  { code: "es", name: t("translatorAi.languages.es") },
  { code: "ru", name: t("translatorAi.languages.ru") },
];

onMounted(async () => {
  if (!("LanguageDetector" in self) || !("Translator" in self)) {
    isSupported.value = false;
    return;
  }

  try {
    detector.value = await (self as any).LanguageDetector.create();
  } catch (e) {
    console.error("Failed to create detector", e);
  }
});

const languageTagToHumanReadable = (languageTag: string) => {
  const langMatch = languages.find(
    (l) =>
      l.code === languageTag || (languageTag === "zh-Hans" && l.code === "zh"),
  );
  if (langMatch) return langMatch.name;

  try {
    const displayNames = new Intl.DisplayNames(
      [t("lang.label") === t("lang.zhCN") ? "zh-CN" : "en-US"],
      {
        type: "language",
      },
    );
    return displayNames.of(languageTag);
  } catch (e) {
    return languageTag;
  }
};

const detectLanguage = async (text: string) => {
  if (!detector.value || !text.trim()) {
    sourceLangDetected.value = "";
    return;
  }

  isDetecting.value = true;
  try {
    const results = await detector.value.detect(text.trim());
    if (results && results.length > 0) {
      sourceLangDetected.value = results[0].detectedLanguage;
    }
  } catch (e) {
    console.error("Detection failed", e);
  } finally {
    isDetecting.value = false;
  }
};

const translate = async () => {
  if (!sourceText.value.trim()) return;

  let sLang = sourceLangSelected.value;
  if (sLang === "auto") {
    if (!sourceLangDetected.value) return;
    sLang = sourceLangDetected.value;
  }

  sLang = sLang === "zh-Hans" ? "zh" : sLang;
  const tLang = targetLang.value;

  if (sLang === tLang) {
    targetText.value = sourceText.value;
    return;
  }

  isTranslating.value = true;
  try {
    const availability = await (self as any).Translator.availability({
      sourceLanguage: sLang,
      targetLanguage: tLang,
    });

    if (availability === "unavailable") {
      showToast(t("translatorAi.notAvailable"), "error");
      isTranslating.value = false;
      return;
    }

    if (availability === "downloadable") {
      isDownloading.value = true;
      downloadProgress.value = 0;
    }

    translator.value = await (self as any).Translator.create({
      sourceLanguage: sLang,
      targetLanguage: tLang,
      monitor(m: any) {
        m.addEventListener("downloadprogress", (e: any) => {
          downloadProgress.value = Math.round((e.loaded / e.total) * 100);
        });
      },
    });

    targetText.value = await translator.value.translate(sourceText.value);
  } catch (e) {
    console.error("Translation failed", e);
    showToast(t("translatorAi.apiError"), "error");
  } finally {
    isTranslating.value = false;
    isDownloading.value = false;
  }
};

let debounceTimer: any = null;
watch(sourceText, (newVal) => {
  clearTimeout(debounceTimer);
  if (!newVal.trim()) {
    targetText.value = "";
    sourceLangDetected.value = "";
    return;
  }

  debounceTimer = setTimeout(async () => {
    if (sourceLangSelected.value === "auto") {
      await detectLanguage(newVal);
    }
    await translate();
  }, 500);
});

watch([targetLang, sourceLangSelected], async () => {
  if (sourceText.value.trim()) {
    if (sourceLangSelected.value === "auto") {
      await detectLanguage(sourceText.value);
    }
    await translate();
  }
});

const copyToClipboard = async (text: string, type: "source" | "target") => {
  if (!text) return;
  await navigator.clipboard.writeText(text);
  if (type === "source") {
    copiedSource.value = true;
    setTimeout(() => (copiedSource.value = false), 2000);
  } else {
    copiedTarget.value = true;
    setTimeout(() => (copiedTarget.value = false), 2000);
  }
  showToast(t("common.copySuccess"));
};

const clearAll = () => {
  sourceText.value = "";
  targetText.value = "";
  sourceLangDetected.value = "";
};

const swapLanguages = () => {
  let sLang = sourceLangSelected.value;
  if (sLang === "auto") {
    if (!sourceLangDetected.value) return;
    sLang = sourceLangDetected.value;
  }

  const currentSource = sLang === "zh-Hans" ? "zh" : sLang;
  const currentTarget = targetLang.value;

  if (languages.some((l) => l.code === currentSource)) {
    sourceLangSelected.value = currentTarget;
    targetLang.value = currentSource;
    sourceText.value = targetText.value;
  }
};
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <button
        @click="clearAll"
        class="btn-destructive px-3 py-1.5 md:px-4 md:py-2"
      >
        <Trash2 class="h-4 w-4" />
        <span class="hidden sm:inline">{{ $t("common.clearAll") }}</span>
      </button>
    </template>

    <div
      v-if="!isSupported"
      class="bg-destructive/10 border border-destructive/20 rounded-3xl p-8 text-center space-y-6"
    >
      <div class="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
        <AlertCircle class="h-10 w-10 text-destructive" />
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-important">
          {{ $t("translatorAi.notSupportedTitle") }}
        </h3>
        <p class="text-muted-foreground max-w-md mx-auto">
          {{ $t("translatorAi.notSupportedDesc") }}
        </p>
      </div>
      <a
        href="https://developer.chrome.com/docs/ai/translator-api#get-started"
        target="_blank"
        class="inline-flex items-center gap-2 text-blue-500 hover:underline font-medium"
      >
        {{ $t("translatorAi.howToEnable") }}
        <ArrowRightLeft class="h-4 w-4 rotate-90" />
      </a>
    </div>

    <div v-else class="space-y-6">
      <!-- Status Banner for Downloading -->
      <div
        v-if="isDownloading"
        class="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div class="flex items-center gap-3">
          <Loader2 class="h-5 w-5 text-blue-500 animate-spin" />
          <span class="text-blue-600 font-bold text-sm">
            {{
              $t("translatorAi.modelDownloading", {
                progress: downloadProgress,
              })
            }}
          </span>
        </div>
        <div
          class="w-24 md:w-48 bg-blue-500/10 h-2 rounded-full overflow-hidden"
        >
          <div
            class="bg-blue-500 h-full transition-all duration-300"
            :style="{ width: `${downloadProgress}%` }"
          ></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative">
        <!-- Source Pane -->
        <div class="flex flex-col space-y-2 md:space-y-3">
          <div class="flex items-center justify-between px-2 shrink-0 h-10">
            <div class="flex items-center gap-2">
              <span class="label-uppercase">{{
                $t("translatorAi.source")
              }}</span>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-7 px-2.5 rounded-lg border-none hover:bg-secondary/80 text-[11px] font-bold uppercase tracking-wider transition-all focus-visible:ring-0 active:scale-95 flex items-center gap-1.5"
                  >
                    {{
                      sourceLangSelected === "auto"
                        ? $t("translatorAi.languages.auto")
                        : languages.find((l) => l.code === sourceLangSelected)
                            ?.name || sourceLangSelected
                    }}
                    <ChevronDown class="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  class="w-40 p-1.5 rounded-xl shadow-xl border-muted/50 backdrop-blur-lg z-50"
                >
                  <DropdownMenuItem
                    @click="sourceLangSelected = 'auto'"
                    class="rounded-lg cursor-pointer flex items-center justify-between py-2 px-3 transition-colors outline-none"
                    :class="
                      sourceLangSelected === 'auto'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'focus:bg-muted focus:text-foreground'
                    "
                  >
                    <span class="font-medium text-sm">{{
                      $t("translatorAi.languages.auto")
                    }}</span>
                    <Check
                      v-if="sourceLangSelected === 'auto'"
                      class="h-3.5 w-3.5"
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-for="lang in languages"
                    :key="lang.code"
                    @click="sourceLangSelected = lang.code"
                    class="rounded-lg cursor-pointer flex items-center justify-between py-2 px-3 transition-colors outline-none"
                    :class="
                      sourceLangSelected === lang.code
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'focus:bg-muted focus:text-foreground'
                    "
                  >
                    <span class="font-medium text-sm">{{ lang.name }}</span>
                    <Check
                      v-if="sourceLangSelected === lang.code"
                      class="h-3.5 w-3.5"
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <span
                v-if="isDetecting"
                class="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground/70 font-medium flex items-center gap-1"
              >
                <Loader2 class="h-3 w-3 animate-spin" />
                {{ $t("translatorAi.detecting") }}
              </span>
              <span
                v-else-if="sourceLangDetected && sourceLangSelected === 'auto'"
                class="text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-600 font-medium animate-in fade-in zoom-in duration-300"
              >
                {{
                  $t("translatorAi.detected", {
                    lang: languageTagToHumanReadable(sourceLangDetected),
                  })
                }}
              </span>
            </div>
            <button
              @click="copyToClipboard(sourceText, 'source')"
              class="btn-icon h-8 w-8"
              :disabled="!sourceText"
            >
              <Check v-if="copiedSource" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4 opacity-50 hover:opacity-100" />
            </button>
          </div>

          <textarea
            v-model="sourceText"
            :placeholder="$t('translatorAi.sourcePlaceholder')"
            class="flex-1 min-h-[160px] h-[30vh] md:h-80 resize-none font-sans"
          ></textarea>
        </div>

        <!-- Desktop Swap Button -->
        <div
          class="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 bg-background border shadow-sm rounded-full items-center justify-center z-10 text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer group active:scale-90"
          @click="swapLanguages"
          title="Swap"
        >
          <ArrowRightLeft
            class="h-5 w-5 group-hover:scale-110 transition-transform"
          />
        </div>

        <!-- Target Pane -->
        <div class="flex flex-col space-y-2 md:space-y-3">
          <div class="flex items-center justify-between px-2 shrink-0 h-10">
            <div class="flex items-center gap-2">
              <span class="label-uppercase">{{
                $t("translatorAi.target")
              }}</span>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-7 px-2.5 rounded-lg border-none hover:bg-secondary/80 text-[11px] font-bold uppercase tracking-wider transition-all focus-visible:ring-0 active:scale-95 flex items-center gap-1.5"
                  >
                    {{
                      languages.find((l) => l.code === targetLang)?.name ||
                      targetLang
                    }}
                    <ChevronDown class="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  class="w-40 p-1.5 rounded-xl shadow-xl border-muted/50 backdrop-blur-lg z-50"
                >
                  <DropdownMenuItem
                    v-for="lang in languages"
                    :key="lang.code"
                    @click="targetLang = lang.code"
                    class="rounded-lg cursor-pointer flex items-center justify-between py-2 px-3 transition-colors outline-none"
                    :class="
                      targetLang === lang.code
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'focus:bg-muted focus:text-foreground'
                    "
                  >
                    <span class="font-medium text-sm">{{ lang.name }}</span>
                    <Check
                      v-if="targetLang === lang.code"
                      class="h-3.5 w-3.5"
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div class="flex items-center gap-1">
              <span
                v-if="isTranslating"
                class="text-[10px] text-blue-500 flex items-center gap-1 mr-2 font-medium"
              >
                <Loader2 class="h-3 w-3 animate-spin" />
                {{ $t("translatorAi.translating") }}
              </span>
              <button
                @click="copyToClipboard(targetText, 'target')"
                class="btn-icon h-8 w-8"
                :disabled="!targetText"
              >
                <Check v-if="copiedTarget" class="h-4 w-4 text-green-500" />
                <Copy v-else class="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
            </div>
          </div>

          <textarea
            v-model="targetText"
            readonly
            :placeholder="$t('translatorAi.targetPlaceholder')"
            class="flex-1 min-h-[160px] h-[30vh] md:h-80 bg-secondary/10 resize-none font-sans font-medium text-important"
          ></textarea>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped></style>
