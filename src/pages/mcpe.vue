<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  Search,
  Loader2,
  Download,
  ExternalLink,
  Copy,
  X,
  ListTree,
  Clock,
  ChevronRight,
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import {
  getVsList,
  getDownloadLinks,
  type McpeVersion,
  type McpeDownloadLink,
} from "@/api/mcpe";

const { t } = useI18n();
const showToast = inject("showToast") as (
  msg: string,
  type?: "success" | "warning" | "error" | "info",
) => void;

// Tool config for the ToolContainer
const tool = allTools.find((t) => t.id === "mcpe")!;

// State variables
const versionsData = ref<McpeVersion[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const viewMode = ref<"group" | "timeline">("group");
const hideBeta = ref(false);
const expandedGroups = ref<Set<string>>(new Set());

// Selected version state for the dialog
const selectedVersion = ref<McpeVersion | null>(null);
const infoDialog = ref(false);
const loadingLinks = ref(false);
const downloadLinks = ref<McpeDownloadLink[]>([]);
const selectedArch = ref<"v8a" | "v7a">("v8a");

// Scroll Locking for Dialog
watch(infoDialog, (val) => {
  if (val) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    selectedVersion.value = null;
    downloadLinks.value = [];
  }
});

const toggleGroup = (group: string) => {
  if (expandedGroups.value.has(group)) {
    expandedGroups.value.delete(group);
  } else {
    expandedGroups.value.add(group);
  }
};

// Computed properties
const filteredVersions = computed(() => {
  let sorted = [...versionsData.value];

  if (hideBeta.value) {
    sorted = sorted.filter((v) => !v.beta);
  }

  // Sort by date descending
  sorted.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    sorted = sorted.filter((v) => v.version.toLowerCase().includes(q));
  }

  return sorted;
});

const groupedVersions = computed(() => {
  const groups = new Map<string, McpeVersion[]>();
  filteredVersions.value.forEach((v) => {
    // Extract major version: e.g. 1.21.0 -> 1.21
    const parts = v.version.split(".");
    let major = v.version;
    if (parts.length >= 2) {
      major = `${parts[0]}.${parts[1]}`;
    }
    if (!groups.has(major)) {
      groups.set(major, []);
    }
    groups.get(major)!.push(v);
  });

  // Sort groups descending by major version (basic numeric sort for major/minor)
  const sortedPairs = Array.from(groups.entries()).sort((a, b) => {
    const pa = a[0].split(".").map(Number);
    const pb = b[0].split(".").map(Number);
    if (pa[0] !== pb[0]) return (pb[0] || 0) - (pa[0] || 0);
    return (pb[1] || 0) - (pa[1] || 0);
  });

  return sortedPairs.map(([major, versions]) => ({ major, versions }));
});

const timelineMonths = computed(() => {
  const months = new Map<string, McpeVersion[]>();
  filteredVersions.value.forEach((v) => {
    const month = v.date.substring(0, 7); // "YYYY-MM"
    if (!months.has(month)) {
      months.set(month, []);
    }
    months.get(month)!.push(v);
  });
  return Array.from(months.entries()).map(([month, versions]) => ({
    month,
    versions,
  }));
});

// Auto-expand the first group when data changes
watch(groupedVersions, (newVal) => {
  if (newVal.length > 0 && expandedGroups.value.size === 0) {
    if (newVal[0]?.major) {
      expandedGroups.value.add(newVal[0].major);
    }
  }
});

// Methods
const openVersionInfo = async (version: McpeVersion) => {
  selectedVersion.value = version;
  infoDialog.value = true;
  await fetchLinks();
};

const fetchLinks = async () => {
  if (!selectedVersion.value) return;

  loadingLinks.value = true;
  downloadLinks.value = [];

  try {
    const res = await getDownloadLinks(
      selectedVersion.value.version,
      selectedArch.value,
    );
    if (res.success && res.data && res.data.downloads) {
      downloadLinks.value = res.data.downloads;
    } else {
      showToast(res.message || t("mcpe.fetchFailed"), "error");
    }
  } catch (err) {
    showToast(t("mcpe.fetchFailed"), "error");
    console.error(err);
  } finally {
    loadingLinks.value = false;
  }
};

const copyPassword = async (pwd: string) => {
  try {
    await navigator.clipboard.writeText(pwd);
    showToast(t("common.copySuccess"), "success");
  } catch (e) {
    showToast(t("common.copyFailed"), "error");
  }
};

const handleCopyAndOpen = async (link: McpeDownloadLink) => {
  if (link.password) {
    await copyPassword(link.password);
  }
  window.open(link.url, "_blank");
};

watch(selectedArch, () => {
  if (infoDialog.value && selectedVersion.value) {
    fetchLinks();
  }
});

// Lifecycle
onMounted(async () => {
  loading.value = true;
  try {
    const res = await getVsList();
    if (res.success && res.data && res.data.versions) {
      versionsData.value = res.data.versions;
    } else {
      showToast(res.message || t("mcpe.loadFailed"), "error");
    }
  } catch (e) {
    showToast(t("mcpe.loadFailed"), "error");
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Search Panel -->
      <div
        class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6 space-y-4"
      >
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('mcpe.searchPlaceholder')"
              class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
            />
          </div>

          <!-- Options -->
          <button
            @click="hideBeta = !hideBeta"
            class="px-4 py-3 border rounded-2xl text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            :class="
              hideBeta
                ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                : 'bg-background border-muted text-foreground hover:bg-muted/50'
            "
          >
            <div
              class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
              :class="
                hideBeta
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-muted-foreground/50'
              "
            >
              <svg
                v-if="hideBeta"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-3 h-3 text-white"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            {{ $t("mcpe.hideBeta") }}
          </button>
        </div>

        <div
          class="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mt-2"
        >
          <p class="text-xs text-muted-foreground">
            {{ $t("mcpe.resultCount", { count: filteredVersions.length }) }}
          </p>
          <div class="flex bg-muted/50 p-1 rounded-xl w-full sm:w-auto">
            <button
              @click="viewMode = 'group'"
              class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="
                viewMode === 'group'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              <ListTree class="w-4 h-4" />
              {{ $t("mcpe.groupView") }}
            </button>
            <button
              @click="viewMode = 'timeline'"
              class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="
                viewMode === 'timeline'
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              <Clock class="w-4 h-4" />
              {{ $t("mcpe.timelineView") }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-10 w-10 text-blue-500 animate-spin" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredVersions.length === 0"
        class="py-16 text-center text-muted-foreground"
      >
        {{ $t("mcpe.noResults") }}
      </div>

      <!-- Group View -->
      <div v-else-if="viewMode === 'group'" class="space-y-4">
        <div
          v-for="{ major, versions } in groupedVersions"
          :key="major"
          class="bg-card/50 border border-muted/80 rounded-2xl overflow-hidden transition-all duration-300"
        >
          <button
            @click="toggleGroup(major)"
            class="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors text-left focus:outline-none group"
          >
            <div class="flex items-center gap-3">
              <ChevronRight
                class="w-5 h-5 transition-transform duration-300"
                :class="
                  expandedGroups.has(major)
                    ? 'rotate-90 text-blue-500'
                    : 'text-muted-foreground group-hover:text-foreground'
                "
              />
              <h3 class="text-lg sm:text-xl font-bold tracking-tighter">
                {{ major }}
              </h3>
            </div>
            <span
              class="text-xs px-2 sm:px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 font-medium shrink-0"
              >{{ versions.length }} 个版本</span
            >
          </button>

          <!-- Animated Expand/Collapse Container -->
          <div
            class="grid transition-all duration-300 ease-in-out items-start"
            :class="
              expandedGroups.has(major)
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            "
          >
            <div class="overflow-hidden min-h-0">
              <div
                class="p-4 sm:p-5 pt-0 border-t border-muted/50 bg-background/50"
              >
                <div
                  class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4 sm:mt-5"
                >
                  <button
                    v-for="version in versions"
                    :key="version.version"
                    @click="openVersionInfo(version)"
                    class="group/card flex flex-col p-4 rounded-2xl bg-card border border-muted/80 hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-lg hover:shadow-blue-500/10 transition-all active:scale-[0.98] text-left"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span
                        class="text-[10px] font-medium text-muted-foreground"
                        >{{ version.date.slice(0, 10) }}</span
                      >
                      <span
                        class="text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0"
                        :class="
                          version.beta
                            ? 'bg-orange-500/10 text-orange-600'
                            : 'bg-green-500/10 text-green-600'
                        "
                      >
                        {{
                          version.beta ? $t("mcpe.beta") : $t("mcpe.release")
                        }}
                      </span>
                    </div>
                    <h3
                      class="text-base sm:text-lg font-bold tracking-tight text-important truncate mb-1 group-hover/card:text-blue-500 transition-colors"
                    >
                      {{ version.version }}
                    </h3>
                    <p class="text-[10px] sm:text-xs text-muted-foreground">
                      {{ version.size }}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline View -->
      <div v-else-if="viewMode === 'timeline'" class="space-y-12 py-4">
        <div
          v-for="{ month, versions } in timelineMonths"
          :key="month"
          class="relative"
        >
          <!-- Month Banner/Box Header -->
          <div
            class="sticky top-20 z-20 w-fit mx-auto px-5 py-2 rounded-2xl bg-card/80 backdrop-blur-md border border-muted shadow-sm text-sm font-bold text-important tracking-widest mb-8 flex items-center gap-2"
          >
            <Clock class="w-4 h-4 text-blue-500" />
            {{ month }}
          </div>

          <div
            class="relative pl-6 sm:pl-0 space-y-6 before:absolute before:inset-0 before:left-[11px] sm:before:left-1/2 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-muted before:to-transparent"
          >
            <div
              v-for="version in versions"
              :key="version.version"
              class="relative flex items-center justify-between sm:justify-normal sm:odd:flex-row-reverse group select-none"
            >
              <!-- Timeline Dot -->
              <div
                class="flex items-center justify-center w-6 h-6 rounded-full border-4 border-background bg-muted text-muted-foreground group-hover:bg-blue-500 group-hover:border-blue-100 group-hover:text-white shrink-0 sm:order-1 sm:group-odd:-translate-x-1/2 sm:group-even:translate-x-1/2 shadow transition-all duration-300 absolute left-0 sm:left-1/2 transform sm:-translate-x-1/2 z-10"
              ></div>

              <!-- Content Card -->
              <div
                class="w-[calc(100%-2rem)] sm:w-[calc(50%-2.5rem)] p-4 sm:p-5 rounded-2xl bg-card/60 backdrop-blur-sm border border-muted/80 cursor-pointer hover:border-blue-500/50 hover:bg-card hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 active:scale-[0.98] text-left ml-7 sm:ml-0 overflow-hidden relative"
                @click="openVersionInfo(version)"
              >
                <div
                  class="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>

                <div class="flex items-center justify-between mb-3">
                  <span
                    class="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
                  >
                    {{ version.date }}
                  </span>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-md font-medium shrink-0 uppercase tracking-wider"
                    :class="
                      version.beta
                        ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                        : 'bg-green-500/10 text-green-600 border border-green-500/20'
                    "
                  >
                    {{ version.beta ? $t("mcpe.beta") : $t("mcpe.release") }}
                  </span>
                </div>

                <h3
                  class="text-xl sm:text-2xl font-black tracking-tighter text-important mb-1 group-hover:text-blue-500 transition-colors"
                >
                  {{ version.version }}
                </h3>
                <p class="text-xs font-medium text-muted-foreground/80">
                  {{ version.size }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Information Dialog -->
      <div
        class="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300"
        :class="
          infoDialog
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        "
        @click.self="infoDialog = false"
      >
        <div
          class="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300"
          :class="
            infoDialog
              ? 'translate-y-0 sm:scale-100'
              : 'translate-y-full sm:translate-y-0 sm:scale-95'
          "
        >
          <!-- Header -->
          <div class="flex flex-col border-b border-muted/50 p-6 pb-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xl font-bold text-important">
                {{ $t("mcpe.downloadTitle") }}
              </h3>
              <button
                @click="infoDialog = false"
                class="btn-icon bg-muted/50 hover:bg-muted text-muted-foreground rounded-full p-1.5 transition-colors"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="text-2xl font-black text-blue-500 tracking-tighter"
                >{{ selectedVersion?.version }}</span
              >
              <span
                v-if="selectedVersion"
                class="text-xs px-2 py-0.5 rounded border font-medium uppercase tracking-wider"
                :class="
                  selectedVersion.beta
                    ? 'bg-orange-500/5 text-orange-600 border-orange-500/20'
                    : 'bg-green-500/5 text-green-600 border-green-500/20'
                "
              >
                {{
                  selectedVersion.beta ? $t("mcpe.beta") : $t("mcpe.release")
                }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[60vh]">
            <!-- Architecture Selector -->
            <div class="mb-6 space-y-2">
              <label class="text-sm font-bold text-muted-foreground">{{
                $t("mcpe.archSelector")
              }}</label>
              <div class="flex gap-2">
                <button
                  class="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                  :class="
                    selectedArch === 'v8a'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                      : 'border-muted bg-card text-foreground hover:bg-muted/50'
                  "
                  @click="selectedArch = 'v8a'"
                >
                  {{ $t("mcpe.v8a") }}
                </button>
                <button
                  class="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                  :class="
                    selectedArch === 'v7a'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                      : 'border-muted bg-card text-foreground hover:bg-muted/50'
                  "
                  @click="selectedArch = 'v7a'"
                >
                  {{ $t("mcpe.v7a") }}
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <div
                v-if="loadingLinks"
                class="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-3"
              >
                <Loader2 class="h-8 w-8 text-blue-500 animate-spin" />
                <span class="text-sm font-medium">{{
                  $t("mcpe.downloadingInfo")
                }}</span>
              </div>

              <div
                v-else-if="downloadLinks.length > 0"
                v-for="(link, index) in downloadLinks"
                :key="index"
                class="p-4 rounded-2xl border border-muted/80 bg-muted/10 group hover:border-blue-500/30 transition-colors"
              >
                <div class="flex items-center justify-between mb-3">
                  <span
                    class="font-bold text-important flex items-center gap-2"
                  >
                    <Download class="w-4 h-4 text-blue-500" />
                    {{ link.name }}
                  </span>
                </div>

                <div
                  v-if="link.password"
                  class="mb-4 flex items-center justify-between bg-background border border-muted/50 p-2.5 rounded-xl"
                >
                  <div class="flex flex-col">
                    <span
                      class="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5"
                      >{{ $t("mcpe.password") }}</span
                    >
                    <span
                      class="text-sm tracking-widest text-important font-bold"
                      >{{ link.password }}</span
                    >
                  </div>
                  <button
                    @click="copyPassword(link.password)"
                    class="btn-icon p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors"
                    :title="$t('common.copy')"
                  >
                    <Copy class="w-4 h-4" />
                  </button>
                </div>

                <button
                  @click="handleCopyAndOpen(link)"
                  class="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
                >
                  {{
                    link.password
                      ? $t("mcpe.copyPassword")
                      : $t("mcpe.openLink")
                  }}
                  <ExternalLink class="w-4 h-4" />
                </button>
              </div>

              <div
                v-else-if="!loadingLinks"
                class="py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2"
              >
                <span>该版本/架构下暂无可用下载链接。</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
