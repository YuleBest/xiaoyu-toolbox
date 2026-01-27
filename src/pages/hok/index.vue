<template>
  <ToolContainer id="hok">
    <div class="max-width-1200 mx-auto w-100 py-4 py-md-8">
      <!-- Search Section -->
      <v-card
        elevation="0"
        border
        class="mb-8 rounded-xl overflow-hidden shadow-sm search-card position-relative"
      >
        <v-card-text class="pa-6 position-relative">
          <v-text-field
            v-model="searchQuery"
            label="搜索英雄、装备或技能..."
            placeholder="输入名称..."
            variant="solo"
            flat
            rounded="xl"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            class="mb-6 search-input"
            density="comfortable"
          >
          </v-text-field>

          <div
            class="d-flex flex-wrap align-center justify-space-between gap-4"
          >
            <v-chip-group
              v-model="selectedCategory"
              mandatory
              class="category-chips flex-grow-1"
              variant="flat"
              selected-class="chip-selected"
            >
              <v-chip
                value="hero"
                class="category-chip px-4 font-weight-bold"
                height="40"
              >
                <v-icon start icon="mdi-shield-sword"></v-icon>
                英雄
              </v-chip>
              <v-chip
                value="item"
                class="category-chip px-4 font-weight-bold"
                height="40"
              >
                <v-icon start icon="mdi-sword"></v-icon>
                装备
              </v-chip>
              <v-chip
                value="skill"
                class="category-chip px-4 font-weight-bold"
                height="40"
              >
                <v-icon start icon="mdi-lightning-bolt"></v-icon>
                技能
              </v-chip>
            </v-chip-group>

            <!-- Hero/Item Type Filters -->
            <v-slide-x-transition mode="out-in">
              <div v-if="selectedCategory === 'hero'">
                <v-chip-group
                  v-model="selectedHeroType"
                  selected-class="text-primary"
                  column
                >
                  <v-chip value="all" filter variant="text" size="small"
                    >全部</v-chip
                  >
                  <v-chip value="1" filter variant="text" size="small"
                    >战士</v-chip
                  >
                  <v-chip value="2" filter variant="text" size="small"
                    >法师</v-chip
                  >
                  <v-chip value="3" filter variant="text" size="small"
                    >坦克</v-chip
                  >
                  <v-chip value="4" filter variant="text" size="small"
                    >刺客</v-chip
                  >
                  <v-chip value="5" filter variant="text" size="small"
                    >射手</v-chip
                  >
                  <v-chip value="6" filter variant="text" size="small"
                    >辅助</v-chip
                  >
                </v-chip-group>
              </div>
              <div v-else-if="selectedCategory === 'item'">
                <v-chip-group
                  v-model="selectedItemType"
                  selected-class="text-primary"
                  column
                >
                  <v-chip value="all" filter variant="text" size="small"
                    >全部</v-chip
                  >
                  <v-chip value="1" filter variant="text" size="small"
                    >攻击</v-chip
                  >
                  <v-chip value="2" filter variant="text" size="small"
                    >法师</v-chip
                  >
                  <v-chip value="3" filter variant="text" size="small"
                    >防御</v-chip
                  >
                  <v-chip value="4" filter variant="text" size="small"
                    >移动</v-chip
                  >
                  <v-chip value="5" filter variant="text" size="small"
                    >打野</v-chip
                  >
                  <v-chip value="7" filter variant="text" size="small"
                    >游走</v-chip
                  >
                </v-chip-group>
              </div>
            </v-slide-x-transition>
          </div>
        </v-card-text>
      </v-card>

      <!-- Results Section -->
      <div class="text-caption text-medium-emphasis px-2 serach-number">
        {{ filteredResults.length }} 个结果
      </div>
      <v-fade-transition mode="out-in">
        <div v-if="filteredResults.length > 0" :key="selectedCategory">
          <!-- Hero Results -->
          <div v-if="selectedCategory === 'hero'">
            <v-row dense>
              <v-col
                v-for="hero in filteredResults"
                :key="hero.ename"
                cols="3"
                md="1"
                xl="1"
              >
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    class="hero-card rounded-lg overflow-hidden position-relative"
                    v-bind="props"
                    :elevation="isHovering ? 8 : 0"
                    @click="showHeroDetail(hero)"
                    border
                  >
                    <v-img
                      :src="getHeroImage(hero)"
                      aspect-ratio="1"
                      cover
                      class="hero-image transition-swing"
                      :class="{ 'scale-110': isHovering }"
                    >
                      <template v-slot:placeholder>
                        <div
                          class="d-flex align-center justify-center fill-height bg-surface-variant"
                        >
                          <v-icon color="grey-lighten-1">mdi-image</v-icon>
                        </div>
                      </template>
                    </v-img>

                    <div
                      class="hero-name-overlay d-flex align-end justify-center pb-1"
                    >
                      <span
                        class="text-white text-caption font-weight-bold text-truncate px-1"
                        style="font-size: 0.75rem"
                      >
                        {{ hero.cname }}
                      </span>
                    </div>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>
          </div>

          <!-- Item Results -->
          <div v-if="selectedCategory === 'item'">
            <v-row dense>
              <v-col
                v-for="item in filteredResults"
                :key="item.item_id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    class="item-card rounded-lg overflow-hidden h-100 transition-swing"
                    border
                    variant="flat"
                    v-bind="props"
                    :elevation="isHovering ? 4 : 0"
                    :class="{ 'on-hover': isHovering }"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex align-start mb-2">
                        <v-avatar
                          size="48"
                          rounded="lg"
                          class="mr-3 flex-shrink-0 elevation-1 bg-surface-light"
                        >
                          <v-img :src="getItemImage(item.item_id)" cover>
                            <template v-slot:placeholder>
                              <div
                                class="d-flex align-center justify-center fill-height"
                              >
                                <v-icon size="20" color="grey"
                                  >mdi-sword</v-icon
                                >
                              </div>
                            </template>
                          </v-img>
                        </v-avatar>
                        <div class="flex-grow-1 min-w-0">
                          <div
                            class="d-flex justify-space-between align-center mb-1"
                          >
                            <div
                              class="text-subtitle-2 font-weight-bold text-truncate"
                            >
                              {{ item.item_name }}
                            </div>
                            <v-chip
                              size="x-small"
                              variant="flat"
                              color="amber-lighten-4"
                              class="text-amber-darken-4 font-weight-bold px-1"
                              style="height: 18px"
                            >
                              <v-icon
                                start
                                icon="mdi-gold"
                                size="10"
                                class="item_price"
                              ></v-icon>
                              {{ item.total_price }}
                            </v-chip>
                          </div>
                          <div class="d-flex flex-wrap gap-1">
                            <v-chip
                              size="x-small"
                              variant="tonal"
                              :color="getItemTypeColor(item.item_type)"
                              style="height: 20px"
                              class="px-2"
                            >
                              {{ getItemTypeName(item.item_type) }}
                            </v-chip>
                          </div>
                        </div>
                      </div>
                      <v-divider class="my-2 opacity-20"></v-divider>
                      <div
                        class="text-caption item-description text-medium-emphasis"
                        v-html="item.des1"
                      ></div>
                      <div
                        v-if="item.des2"
                        class="text-caption text-primary mt-1 item-description font-weight-medium"
                        v-html="item.des2"
                      ></div>
                    </v-card-text>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>
          </div>

          <!-- Skill Results -->
          <div v-if="selectedCategory === 'skill'">
            <v-row dense>
              <v-col
                v-for="skill in filteredResults"
                :key="skill.summoner_id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    class="skill-card rounded-lg overflow-hidden h-100 transition-swing"
                    border
                    variant="flat"
                    v-bind="props"
                    :elevation="isHovering ? 4 : 0"
                    :class="{ 'on-hover': isHovering }"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex align-center mb-3">
                        <v-avatar
                          size="48"
                          rounded="lg"
                          class="mr-3 flex-shrink-0 elevation-1 bg-surface-light"
                        >
                          <v-img :src="getSkillImage(skill.summoner_id)" cover>
                            <template v-slot:placeholder>
                              <div
                                class="d-flex align-center justify-center fill-height"
                              >
                                <v-icon size="20" color="grey"
                                  >mdi-lightning-bolt</v-icon
                                >
                              </div>
                            </template>
                          </v-img>
                        </v-avatar>
                        <div class="flex-grow-1 min-w-0">
                          <div
                            class="text-subtitle-2 font-weight-bold mb-1 text-truncate"
                          >
                            {{ skill.summoner_name }}
                          </div>
                          <v-chip
                            size="x-small"
                            variant="tonal"
                            color="purple"
                            style="height: 20px"
                          >
                            召唤师等级 Lv.{{
                              skill.summoner_rank.replace(/\D/g, "") || 1
                            }}
                            解锁
                          </v-chip>
                        </div>
                      </div>
                      <v-divider class="mb-2 opacity-20"></v-divider>
                      <div class="text-caption text-medium-emphasis">
                        {{ skill.summoner_description }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-fade-transition>

      <!-- Empty State -->
      <v-scale-transition>
        <div
          v-if="
            (filteredResults.length === 0 && searchQuery) ||
            (filteredResults.length === 0 && selectedHeroType !== 'all') ||
            (filteredResults.length === 0 && selectedItemType !== 'all')
          "
          class="text-center py-16 opacity-60"
        >
          <div
            class="bg-surface-variant rounded-circle d-inline-flex pa-8 mb-4"
          >
            <v-icon
              size="64"
              icon="mdi-magnify-remove-outline"
              color="grey"
            ></v-icon>
          </div>
          <div class="text-h6 font-weight-bold">没有找到相关数据</div>
          <div class="text-body-2">请尝试更换关键词或筛选条件</div>
        </div>
      </v-scale-transition>

      <!-- Initial State -->
      <v-scale-transition>
        <div
          v-if="
            !searchQuery &&
            selectedHeroType === 'all' &&
            selectedItemType === 'all' &&
            filteredResults.length === 0
          "
          class="text-center py-16 opacity-60"
        >
          <div
            class="bg-surface-variant rounded-circle d-inline-flex pa-8 mb-4"
          >
            <v-icon
              size="64"
              icon="mdi-database-search-outline"
              color="primary"
            ></v-icon>
          </div>
          <div class="text-h6 font-weight-bold">开始探索</div>
          <div class="text-body-2">输入关键词或选择分类查看详情</div>
        </div>
      </v-scale-transition>
    </div>

    <!-- Hero Detail Bottom Sheet -->
    <v-dialog
      v-model="heroDialog"
      transition="dialog-bottom-transition"
      class="hero-detail-dialog"
      scrollable
    >
      <v-card
        v-if="selectedHero"
        class="hero-detail-card rounded-t-xl overflow-hidden d-flex flex-column bg-surface"
      >
        <!-- Drag Handle Indicator -->
        <div
          class="d-flex justify-center pt-3 pb-1 bg-surface w-100 flex-shrink-0"
          style="z-index: 10"
        >
          <div
            class="rounded-pill bg-grey-lighten-2"
            style="width: 48px; height: 6px"
          ></div>
        </div>

        <!-- Sticky Header (Glassmorphism) -->
        <div
          class="hero-header px-4 px-md-8 py-4 d-flex align-center flex-shrink-0 position-relative border-b"
          style="z-index: 5"
        >
          <!-- Background Gradient -->
          <div
            class="position-absolute top-0 left-0 w-100 h-100 opacity-10"
          ></div>

          <!-- Hero Basic Info -->
          <div class="d-flex align-center flex-grow-1 position-relative">
            <v-avatar
              size="56"
              class="mr-4 elevation-2 border border-white bg-surface-variant"
            >
              <v-img :src="getHeroImage(selectedHero)"></v-img>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold lh-1">
                {{ selectedHero.cname }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ selectedHero.title }}
              </div>
            </div>
            <v-divider vertical class="mx-4 hidden-xs"></v-divider>
            <div class="d-none d-sm-flex gap-2">
              <v-chip
                size="small"
                :color="getHeroTypeColor(selectedHero.hero_type)"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ getHeroTypeName(selectedHero.hero_type) }}
              </v-chip>
              <v-chip
                v-if="selectedHero.hero_type2"
                size="small"
                :color="getHeroTypeColor(selectedHero.hero_type2)"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ getHeroTypeName(selectedHero.hero_type2) }}
              </v-chip>
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            density="comfortable"
            @click="heroDialog = false"
            class="position-relative"
          ></v-btn>
        </div>
        <div style="display: none !important">
          <!-- Decorative Background Circle -->
          <div
            style="
              position: absolute;
              top: -20px;
              right: -20px;
              width: 200px;
              height: 200px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              filter: blur(20px);
            "
          ></div>

          <div class="d-flex align-center position-relative" style="z-index: 1">
            <v-avatar size="88" class="mr-5 elevation-4 border-md border-white">
              <v-img :src="getHeroImage(selectedHero)"></v-img>
            </v-avatar>

            <div>
              <div class="text-h4 font-weight-bold mb-1 shadow-text">
                {{ selectedHero.cname }}
              </div>
              <div class="d-flex align-center gap-2">
                <span class="text-subtitle-1 opacity-90">{{
                  selectedHero.title
                }}</span>
                <v-divider
                  vertical
                  class="mx-2 border-opacity-50"
                  style="height: 16px"
                ></v-divider>
                <v-chip
                  size="small"
                  variant="flat"
                  class="font-weight-bold bg-white text-black"
                >
                  {{ getHeroTypeName(selectedHero.hero_type) }}
                </v-chip>
                <v-chip
                  v-if="selectedHero.hero_type2"
                  size="small"
                  variant="flat"
                  class="font-weight-bold bg-white text-black"
                >
                  {{ getHeroTypeName(selectedHero.hero_type2) }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <v-card-text
          class="pa-0 flex-grow-1 overflow-y-auto"
          style="min-height: 300px"
        >
          <div class="max-width-1200 mx-auto w-100 h-100">
            <v-row no-gutters class="h-100">
              <!-- Left Column: Skills (Mobile: Top) -->
              <v-col cols="12" md="7" class="pa-4 pa-md-6 border-e-md">
                <!-- Mobile Only Tags -->
                <div class="d-flex d-sm-none gap-2 mb-6">
                  <v-chip
                    size="small"
                    :color="getHeroTypeColor(selectedHero.hero_type)"
                    variant="tonal"
                    class="font-weight-bold"
                  >
                    {{ getHeroTypeName(selectedHero.hero_type) }}
                  </v-chip>
                  <v-chip
                    v-if="selectedHero.hero_type2"
                    size="small"
                    :color="getHeroTypeColor(selectedHero.hero_type2)"
                    variant="tonal"
                    class="font-weight-bold"
                  >
                    {{ getHeroTypeName(selectedHero.hero_type2) }}
                  </v-chip>
                </div>

                <div class="text-h6 font-weight-bold mb-4 d-flex align-center">
                  <v-icon
                    icon="mdi-flash"
                    color="amber-darken-2"
                    class="mr-2"
                  ></v-icon>
                  技能详情
                </div>

                <div v-if="selectedHero.skills">
                  <div
                    v-for="(skill, index) in selectedHero.skills"
                    :key="index"
                    class="mb-6 skill-item"
                  >
                    <div class="d-flex align-start mb-2">
                      <div
                        class="skill-badge mr-3 mt-1 text-caption font-weight-black d-flex align-center justify-center rounded-lg flex-shrink-0"
                        :class="
                          index === 0
                            ? 'bg-primary text-white'
                            : 'bg-surface-variant text-medium-emphasis'
                        "
                        style="width: 36px; height: 36px"
                      >
                        {{ index === 0 ? "被" : index }}
                      </div>
                      <div>
                        <div class="text-subtitle-1 font-weight-bold">
                          {{ skill.name }}
                        </div>
                        <div
                          class="text-caption text-medium-emphasis font-family-mono"
                        >
                          {{ skill.info }}
                        </div>
                      </div>
                    </div>
                    <div class="pl-12">
                      <div
                        class="text-body-2 text-high-emphasis mb-2"
                        style="line-height: 1.6"
                      >
                        {{ skill.description }}
                      </div>
                      <div
                        v-if="skill.tips"
                        class="text-caption text-primary bg-blue-grey-lighten-5 pa-3 rounded-lg d-flex"
                      >
                        <!-- <v-icon icon="mdi-lightbulb-on-outline" size="16" start class="mt-1"></v-icon> -->
                        <div>{{ skill.tips }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-medium-emphasis">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                  <div class="mt-2 text-caption">正在加载技能数据...</div>
                </div>
              </v-col>

              <!-- Right Column: Skins & Info (Mobile: Bottom) -->
              <v-col
                cols="12"
                md="5"
                class="pa-4 pa-md-6 bg-surface-light h-100"
              >
                <div class="sticky-column-content">
                  <!-- ID Card -->
                  <v-card variant="flat" border class="mb-6 bg-surface">
                    <v-card-text>
                      <div
                        class="d-flex justify-space-between align-center mb-4"
                      >
                        <div class="text-subtitle-2 text-medium-emphasis">
                          档案编号
                        </div>
                        <v-chip
                          size="x-small"
                          variant="flat"
                          color="grey-darken-3"
                          >CONFIDENTIAL</v-chip
                        >
                      </div>
                      <v-row dense>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">
                            MOSS ID
                          </div>
                          <div class="text-h6 font-weight-mono">
                            {{ selectedHero.moss_id || "N/A" }}
                          </div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">
                            内部编号
                          </div>
                          <div class="text-h6 font-weight-mono">
                            {{ selectedHero.ename }}
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <!-- Skins -->
                  <div>
                    <div
                      class="text-h6 font-weight-bold mb-4 d-flex align-center"
                    >
                      <v-icon
                        icon="mdi-tshirt-crew"
                        color="purple-darken-1"
                        class="mr-2"
                      ></v-icon>
                      皮肤图鉴
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <v-chip
                        v-for="(skin, index) in selectedHero.skin_name.split(
                          '|',
                        )"
                        :key="index"
                        variant="outlined"
                        filter
                        class="bg-surface"
                      >
                        {{ skin }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useHead } from "@unhead/vue";
import ToolContainer from "@/components/ToolContainer.vue";

// Data
const heroesData = ref<any[]>([]);
const itemsData = ref<any[]>([]);
const skillsData = ref<any[]>([]);

// Search & Filter State
const searchQuery = ref("");
const selectedCategory = ref("hero");
const selectedHeroType = ref("all");
const selectedItemType = ref("all");

// Dialog State
const heroDialog = ref(false);
const selectedHero = ref<any>(null);

// SEO
useHead({
  title: "王者荣耀战斗查询 - 小于工具箱",
  meta: [
    {
      name: "description",
      content: "王者荣耀英雄、装备、召唤师技能查询工具，快速查找游戏数据。",
    },
    {
      name: "keywords",
      content: "王者荣耀,英雄查询,装备查询,召唤师技能,游戏攻略",
    },
  ],
});

// Load Data
onMounted(async () => {
  try {
    const [heroesRes, itemsRes, skillsRes] = await Promise.all([
      fetch("/src/assets/hok/heros/data.json"),
      fetch("/src/assets/hok/items/item.json"),
      fetch("/src/assets/hok/skills/data.json"),
    ]);

    heroesData.value = await heroesRes.json();
    itemsData.value = await itemsRes.json();
    skillsData.value = await skillsRes.json();
  } catch (error) {
    console.error("Failed to load data:", error);
  }
});

// Computed
const filteredResults = computed(() => {
  let results: any[] = [];

  if (selectedCategory.value === "hero") {
    results = heroesData.value;

    // Filter by hero type
    if (selectedHeroType.value !== "all") {
      results = results.filter(
        (hero) =>
          hero.hero_type === parseInt(selectedHeroType.value) ||
          hero.hero_type2 === parseInt(selectedHeroType.value),
      );
    }

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      results = results.filter(
        (hero) =>
          hero.cname.toLowerCase().includes(query) ||
          hero.title.toLowerCase().includes(query) ||
          hero.id_name.toLowerCase().includes(query),
      );
    }
  } else if (selectedCategory.value === "item") {
    results = itemsData.value;

    // Filter by item type
    if (selectedItemType.value !== "all") {
      results = results.filter(
        (item) => item.item_type === parseInt(selectedItemType.value),
      );
    }

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      results = results.filter((item) =>
        item.item_name.toLowerCase().includes(query),
      );
    }
  } else if (selectedCategory.value === "skill") {
    results = skillsData.value;

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      results = results.filter(
        (skill) =>
          skill.summoner_name.toLowerCase().includes(query) ||
          skill.summoner_description.toLowerCase().includes(query),
      );
    }
  }

  return results;
});

// Methods
const getHeroImage = (hero: any) => {
  return `/src/assets/hok/heros/images/${hero.ename}.webp`;
};

const getItemImage = (itemId: number) => {
  return `/src/assets/hok/items/images/${itemId}.webp`;
};

const getSkillImage = (skillId: number) => {
  return `/src/assets/hok/skills/images/${skillId}.webp`;
};

const getHeroTypeName = (type: number) => {
  const types: Record<number, string> = {
    1: "战士",
    2: "法师",
    3: "坦克",
    4: "刺客",
    5: "射手",
    6: "辅助",
  };
  return types[type] || "未知";
};

const getHeroTypeColor = (type: number) => {
  const colors: Record<number, string> = {
    1: "red",
    2: "blue",
    3: "green",
    4: "purple",
    5: "orange",
    6: "cyan",
  };
  return colors[type] || "grey";
};

const getItemTypeName = (type: number) => {
  const types: Record<number, string> = {
    1: "攻击",
    2: "法术",
    3: "防御",
    4: "移动",
    5: "打野",
    7: "游走",
  };
  return types[type] || "其他";
};

const getItemTypeColor = (type: number) => {
  const colors: Record<number, string> = {
    1: "red",
    2: "blue",
    3: "green",
    4: "cyan",
    5: "purple",
    7: "orange",
  };
  return colors[type] || "grey";
};

const showHeroDetail = async (hero: any) => {
  selectedHero.value = hero;
  heroDialog.value = true;

  try {
    const res = await fetch(`/src/assets/hok/heros/heros/${hero.id_name}.json`);
    if (res.ok) {
      const details = await res.json();
      selectedHero.value = { ...hero, ...details };
    }
  } catch (error) {
    console.error("Error loading hero details:", error);
  }
};
</script>

<style scoped>
.search-card {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-surface)) 0%,
    rgba(var(--v-theme-primary), 0.05) 100%
  );
}

.hero-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.hero-card:active {
  transform: scale(0.95);
}

.hero-image {
  height: 100%;
}

.scale-110 {
  transform: scale(1.1);
}

.hero-name-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0) 100%
  );
  padding-top: 24px;
}

.item-card,
.skill-card {
  transition:
    transform 0.2s,
    border-color 0.2s;
}

.item-card.on-hover,
.skill-card.on-hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  transform: translateY(-2px);
}

.item-description :deep(p) {
  margin: 0;
  line-height: 1.5;
}

.item-description :deep(br) {
  display: block;
  content: "";
  margin-top: 4px;
}

/* Custom Chip Styles */
.category-chip.chip-selected {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
  color: white !important;
}

.shadow-text {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.gap-4 {
  gap: 16px;
}

.gap-2 {
  gap: 8px;
}

/* Hero Detail Bottom Sheet Styles */
:deep(.hero-detail-dialog .v-overlay__content) {
  position: absolute;
  bottom: 0;
  margin: 0;
  width: 100%;
  max-width: 100% !important;
  max-height: 92vh; /* Leave a bit of space at top */
  display: flex;
  flex-direction: column;
}

@media (min-width: 960px) {
  :deep(.hero-detail-dialog .v-overlay__content) {
    max-width: 1000px !important;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0px;
    border-top-left-radius: 24px !important;
    border-top-right-radius: 24px !important;
    padding-bottom: 0;
  }
}

.hero-detail-card {
  height: 92vh;
  display: flex;
  flex-direction: column;
}

.hero-header {
  background: rgba(var(--v-theme-surface), 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.max-width-1200 {
  max-width: 1200px;
}

.sticky-column-content {
  position: sticky;
  top: 24px;
}

.skill-badge {
  line-height: 1;
}

.item_price {
  padding-left: 8px;
  padding-right: 5px;
}

.serach-number {
  margin-top: 0;
  margin-bottom: 20px;
}
</style>
