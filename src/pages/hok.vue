<script setup lang="ts">
import { ref, computed, onMounted, inject } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import { Search, Swords, Shield, Sparkles, X, Loader2 } from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import {
  getHeroList,
  getHeroImages,
  getItemList,
  getItemImages,
  getSummonerList,
  getSummonerImages,
  getHeroDetail,
  type Hero,
  type GameItem,
  type SummonerSkill,
} from "@/api/hok";

const showToast = inject("showToast") as (
  msg: string,
  type?: "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "hok")!;

// Data
const heroesData = ref<Hero[]>([]);
const heroImages = ref<Record<string, string>>({});
const itemsData = ref<GameItem[]>([]);
const itemImages = ref<Record<string, string>>({});
const skillsData = ref<SummonerSkill[]>([]);
const skillImages = ref<Record<string, string>>({});
const loading = ref(true);

// Filters
const selectedCategory = ref<"hero" | "item" | "skill">("hero");
const searchQuery = ref("");
const selectedHeroType = ref("all");
const selectedItemType = ref("all");

// Hero detail
const heroDialog = ref(false);
const selectedHero = ref<any>(null);
const loadingDetail = ref(false);

const categories = computed(() => [
  { id: "hero", label: t("hok.hero"), icon: Swords },
  { id: "item", label: t("hok.item"), icon: Shield },
  { id: "skill", label: t("hok.skill"), icon: Sparkles },
]);

const heroTypes = computed(() => [
  { value: "all", label: t("hok.all") },
  { value: "1", label: t("hok.warrior") },
  { value: "2", label: t("hok.mage") },
  { value: "3", label: t("hok.tank") },
  { value: "4", label: t("hok.assassin") },
  { value: "5", label: t("hok.marksman") },
  { value: "6", label: t("hok.support") },
]);

const itemTypes = computed(() => [
  { value: "all", label: t("hok.all") },
  { value: "1", label: t("hok.attack") },
  { value: "2", label: t("hok.magic") },
  { value: "3", label: t("hok.defense") },
  { value: "4", label: t("hok.movement") },
  { value: "5", label: t("hok.jungle") },
  { value: "7", label: t("hok.roam") },
]);

const heroTypeName = (type: number) => {
  const names: Record<number, string> = {
    1: t("hok.warrior"),
    2: t("hok.mage"),
    3: t("hok.tank"),
    4: t("hok.assassin"),
    5: t("hok.marksman"),
    6: t("hok.support"),
  };
  return names[type] || t("hok.unknown");
};

const heroTypeColor = (type: number) => {
  const colors: Record<number, string> = {
    1: "bg-red-500/10 text-red-500",
    2: "bg-blue-500/10 text-blue-500",
    3: "bg-green-500/10 text-green-500",
    4: "bg-purple-500/10 text-purple-500",
    5: "bg-orange-500/10 text-orange-500",
    6: "bg-cyan-500/10 text-cyan-500",
  };
  return colors[type] || "bg-muted text-muted-foreground";
};

// 解析召唤师技能描述，提取 CD
const parseSkillDesc = (desc: string) => {
  const match = desc.match(/^(\d+秒)CD[：:]\s*/);
  if (match) {
    return { cd: match[1], text: desc.slice(match[0].length) };
  }
  return { cd: "", text: desc };
};

// 装备等级判定
const tier1Names = new Set([
  "铁剑",
  "匕首",
  "搏击拳套",
  "吸血之镰",
  "附魔之羽",
  "咒术典籍",
  "蓝宝石",
  "秘法残页",
  "元流结晶",
  "红玛瑙",
  "布甲",
  "抗魔披风",
  "神速之靴",
  "狩猎宽刃",
  "学识宝石",
]);
const tier2JungleRoam = new Set([
  "游击弯刀",
  "追击刀锋",
  "巡守利斧",
  "近卫",
  "极影",
]);
const getItemTier = (item: GameItem): number => {
  if (tier1Names.has(item.item_name)) return 1;
  if (tier2JungleRoam.has(item.item_name)) return 2;
  // 移动类：除一级外都是二级
  if (item.item_type === 4) return 2;
  // 攻击/法术/防御：没有被动效果（des2）的是二级
  if (!item.des2) return 2;
  return 3;
};

const filteredData = computed(() => {
  if (selectedCategory.value === "hero") {
    let results = heroesData.value;
    if (selectedHeroType.value !== "all") {
      const type = parseInt(selectedHeroType.value);
      results = results.filter(
        (h) => h.hero_type === type || h.hero_type2 === type,
      );
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      results = results.filter(
        (h) =>
          h.cname.toLowerCase().includes(q) ||
          h.title.toLowerCase().includes(q),
      );
    }
    return results;
  }

  if (selectedCategory.value === "item") {
    let results = itemsData.value;
    if (selectedItemType.value !== "all") {
      results = results.filter(
        (i) => i.item_type === parseInt(selectedItemType.value),
      );
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      results = results.filter((i) => i.item_name.toLowerCase().includes(q));
    }
    // 按等级排序，等级内按金币数排序
    return [...results].sort((a, b) => {
      const ta = getItemTier(a);
      const tb = getItemTier(b);
      if (ta !== tb) return ta - tb;
      return a.total_price - b.total_price;
    });
  }

  if (selectedCategory.value === "skill") {
    let results = skillsData.value;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      results = results.filter(
        (s) =>
          s.summoner_name.toLowerCase().includes(q) ||
          s.summoner_description.toLowerCase().includes(q),
      );
    }
    return results;
  }

  return [];
});

// Methods
const getHeroImage = (hero: Hero) => heroImages.value[hero.ename] || "";
const getItemImage = (id: number) => itemImages.value[id.toString()] || "";
const getSkillImage = (id: number) => skillImages.value[id.toString()] || "";

// 为装备属性名后添加图标
const attrIcons: Record<string, string> = {
  物理攻击: "⚔️",
  法术攻击: "🔮",
  最大生命值: "❤️",
  最大法力值: "💧",
  物理防御: "🛡️",
  法术防御: "🔰",
  移动速度: "👟",
  攻速: "⚡",
  暴击率: "💥",
  暴击效果: "💢",
  物理吸血: "🩸",
  法术吸血: "💜",
  冷却缩减: "⏱️",
  物理穿透: "🗡️",
  法术穿透: "✨",
  最大生命: "❤️",
};
const attrPattern = new RegExp(`(${Object.keys(attrIcons).join("|")})`, "g");
const enrichItemDesc = (html: string) =>
  html.replace(attrPattern, (match) => `${match} ${attrIcons[match]}`);

// 缓存已加载的英雄详情，避免重复请求
const heroDetailCache = new Map<number, any>();

const showHeroDetail = (hero: Hero) => {
  selectedHero.value = { ...hero };
  heroDialog.value = true;

  // 已缓存则直接使用，无需加载
  if (heroDetailCache.has(hero.ename)) {
    selectedHero.value = { ...hero, ...heroDetailCache.get(hero.ename) };
    loadingDetail.value = false;
    return;
  }

  loadingDetail.value = true;

  // 等动画完全结束后再发起请求，避免 DOM 更新打断过渡动画
  setTimeout(async () => {
    try {
      const details = await getHeroDetail(hero.ename);
      heroDetailCache.set(hero.ename, details);
      selectedHero.value = { ...hero, ...details };
    } catch (e) {
      console.error("加载英雄详情失败:", e);
    } finally {
      loadingDetail.value = false;
    }
  }, 50);
};

onMounted(async () => {
  loading.value = true;
  try {
    const [heroes, hImages, items, iImages, skills, sImages] =
      await Promise.all([
        getHeroList(),
        getHeroImages(),
        getItemList(),
        getItemImages(),
        getSummonerList(),
        getSummonerImages(),
      ]);
    heroesData.value = heroes;
    heroImages.value = hImages;
    itemsData.value = items;
    itemImages.value = iImages;
    skillsData.value = skills;
    skillImages.value = sImages;
  } catch (e: any) {
    showToast(t("hok.loadFailed"), "error");
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Search & Filters -->
      <div
        class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6 space-y-4"
      >
        <!-- Category Tabs -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="
              selectedCategory = cat.id as any;
              searchQuery = '';
            "
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
            :class="
              selectedCategory === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            "
          >
            <component :is="cat.icon" class="h-4 w-4" />
            {{ cat.label }}
          </button>
        </div>

        <!-- Search -->
        <div class="relative">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="
              selectedCategory === 'hero'
                ? $t('hok.searchHero')
                : selectedCategory === 'item'
                  ? $t('hok.searchItem')
                  : $t('hok.searchSkill')
            "
            class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
          />
        </div>

        <!-- Sub-filters -->
        <div v-if="selectedCategory === 'hero'" class="flex flex-wrap gap-2">
          <button
            v-for="ht in heroTypes"
            :key="ht.value"
            @click="selectedHeroType = ht.value"
            class="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            :class="
              selectedHeroType === ht.value
                ? 'bg-blue-500 text-white'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            "
          >
            {{ ht.label }}
          </button>
        </div>
        <div v-if="selectedCategory === 'item'" class="flex flex-wrap gap-2">
          <button
            v-for="it in itemTypes"
            :key="it.value"
            @click="selectedItemType = it.value"
            class="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            :class="
              selectedItemType === it.value
                ? 'bg-blue-500 text-white'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            "
          >
            {{ it.label }}
          </button>
        </div>

        <!-- Result count -->
        <p class="text-xs text-muted-foreground">
          {{ $t("hok.resultCount", { count: filteredData.length }) }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-10 w-10 text-blue-500 animate-spin" />
      </div>

      <!-- Heroes Grid -->
      <div
        v-if="!loading && selectedCategory === 'hero'"
        class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2.5"
      >
        <button
          v-for="hero in filteredData as Hero[]"
          :key="hero.ename"
          @click="showHeroDetail(hero)"
          class="group rounded-xl overflow-hidden bg-card border border-muted/80 hover:border-blue-500/50 transition-all active:scale-95"
        >
          <img
            :src="getHeroImage(hero)"
            :alt="hero.cname"
            class="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div class="px-1.5 py-1.5 text-center">
            <p class="text-[11px] font-bold truncate leading-tight">
              {{ hero.cname }}
            </p>
            <div class="flex items-center justify-center gap-0.5 mt-1">
              <span
                class="text-[8px] font-medium px-1 py-px rounded"
                :class="heroTypeColor(hero.hero_type)"
              >
                {{ heroTypeName(hero.hero_type) }}
              </span>
              <span
                v-if="hero.hero_type2"
                class="text-[8px] font-medium px-1 py-px rounded"
                :class="heroTypeColor(hero.hero_type2)"
              >
                {{ heroTypeName(hero.hero_type2) }}
              </span>
            </div>
          </div>
        </button>
      </div>

      <!-- Items List -->
      <div
        v-if="!loading && selectedCategory === 'item'"
        class="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <div
          v-for="item in filteredData as GameItem[]"
          :key="item.item_id"
          class="bg-card/30 border border-muted/80 rounded-2xl p-4 flex gap-4 hover:border-blue-500/30 transition-colors"
        >
          <img
            :src="getItemImage(item.item_id)"
            :alt="item.item_name"
            class="w-14 h-14 rounded-xl object-cover shrink-0 bg-muted"
            loading="lazy"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1">
              <p class="text-sm font-bold truncate">{{ item.item_name }}</p>
              <span
                class="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-medium shrink-0"
              >
                {{ item.total_price }} {{ $t("hok.gold") }}
              </span>
            </div>
            <p
              class="text-xs text-muted-foreground leading-relaxed"
              v-html="enrichItemDesc(item.des1)"
            />
            <p
              v-if="item.des2"
              class="text-xs text-muted-foreground leading-relaxed mt-1.5 pt-1.5 border-t border-muted/50"
              v-html="enrichItemDesc(item.des2)"
            />
          </div>
        </div>
      </div>

      <!-- Skills List -->
      <div
        v-if="!loading && selectedCategory === 'skill'"
        class="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <div
          v-for="skill in filteredData as SummonerSkill[]"
          :key="skill.summoner_id"
          class="bg-card/30 border border-muted/80 rounded-2xl p-4 flex gap-4 hover:border-blue-500/30 transition-colors"
        >
          <img
            :src="getSkillImage(skill.summoner_id)"
            :alt="skill.summoner_name"
            class="w-14 h-14 rounded-xl object-cover shrink-0 bg-muted"
            loading="lazy"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <p class="text-sm font-bold truncate">
                {{ skill.summoner_name }}
              </p>
              <span
                class="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-medium shrink-0"
              >
                {{ skill.summoner_rank }}
              </span>
              <span
                v-if="parseSkillDesc(skill.summoner_description).cd"
                class="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-medium shrink-0"
              >
                CD {{ parseSkillDesc(skill.summoner_description).cd }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground leading-relaxed">
              {{ parseSkillDesc(skill.summoner_description).text }}
            </p>
          </div>
        </div>
      </div>

      <!-- Hero Detail Bottom Sheet -->
      <div
        class="fixed inset-0 z-50 flex items-end justify-center sheet-backdrop"
        :class="heroDialog ? 'sheet-open' : 'sheet-closed'"
        @click.self="heroDialog = false"
      >
        <div
          class="bg-card w-full max-w-3xl rounded-t-3xl h-[85vh] flex flex-col shadow-2xl sheet-panel"
        >
          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-10 h-1 rounded-full bg-muted-foreground/20" />
          </div>

          <!-- Header -->
          <div class="flex items-center gap-4 px-6 py-4 border-b">
            <img
              v-if="selectedHero"
              :src="getHeroImage(selectedHero)"
              :alt="selectedHero.cname"
              class="w-16 h-16 rounded-2xl object-cover"
            />
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold truncate">
                {{ selectedHero?.cname }}
              </h3>
              <p class="text-sm text-muted-foreground">
                {{ selectedHero?.title }}
              </p>
              <div class="flex gap-1.5 mt-1">
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                  :class="heroTypeColor(selectedHero?.hero_type)"
                >
                  {{ heroTypeName(selectedHero?.hero_type) }}
                </span>
                <span
                  v-if="selectedHero?.hero_type2"
                  class="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                  :class="heroTypeColor(selectedHero.hero_type2)"
                >
                  {{ heroTypeName(selectedHero.hero_type2) }}
                </span>
              </div>
            </div>
            <button
              @click="heroDialog = false"
              class="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <!-- Loading detail -->
            <div v-if="loadingDetail" class="flex justify-center py-8">
              <Loader2 class="h-8 w-8 text-blue-500 animate-spin" />
            </div>

            <!-- Skills -->
            <div
              v-if="selectedHero?.skills?.length && !loadingDetail"
              class="space-y-3"
            >
              <h4 class="text-sm font-bold">{{ $t("hok.skills") }}</h4>
              <div
                v-for="(skill, i) in selectedHero.skills"
                :key="i"
                class="bg-muted/20 rounded-2xl p-4"
              >
                <p class="text-sm font-bold mb-1">
                  {{ skill.name }}
                </p>
                <p
                  v-if="skill.cooldownAttributes"
                  class="text-xs text-muted-foreground mb-2"
                >
                  {{ $t("hok.cooldown") }}{{ skill.cooldownAttributes }}
                </p>
                <p class="text-xs text-muted-foreground leading-relaxed">
                  {{ skill.description }}
                </p>
              </div>
            </div>

            <!-- Skins -->
            <div
              v-if="selectedHero?.skin_name && !loadingDetail"
              class="space-y-3"
            >
              <h4 class="text-sm font-bold">{{ $t("hok.skins") }}</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skin in selectedHero.skin_name.split('|')"
                  :key="skin"
                  class="px-3 py-1.5 rounded-xl bg-muted/30 text-xs font-medium"
                >
                  {{ skin }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped>
.sheet-backdrop {
  background-color: transparent;
  backdrop-filter: blur(0px);
  transition:
    background-color 500ms cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 500ms cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s;
  will-change: background-color, backdrop-filter;
}

.sheet-backdrop.sheet-open {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  pointer-events: auto;
  visibility: visible;
}

.sheet-backdrop.sheet-closed {
  pointer-events: none;
  visibility: hidden;
  transition:
    background-color 500ms cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 500ms cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s 500ms;
}

.sheet-panel {
  transform: translateY(100%);
  opacity: 0;
  transition:
    transform 500ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 400ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.sheet-open .sheet-panel {
  transform: translateY(0);
  opacity: 1;
}

.sheet-closed .sheet-panel {
  transform: translateY(100%);
  opacity: 0;
}
</style>
