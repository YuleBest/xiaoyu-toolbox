import { useHead, useSeoMeta } from "@unhead/vue";
import { useI18n } from "vue-i18n";
import { allTools } from "@/config/tools";
import { computed } from "vue";
import { useRoute } from "vue-router";

/**
 * 自动管理工具页面的 Meta 信息
 */
export function useToolMeta() {
  const { t } = useI18n();
  const route = useRoute();

  const currentTool = computed(() => {
    const path = route.path;
    // 兼容可能存在的尾部斜杠
    const normalizedPath =
      path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
    return allTools.find((tool) => tool.path === normalizedPath);
  });

  const appName = computed(() => t("common.appName"));

  const metaData = computed(() => {
    if (currentTool.value) {
      const toolTitle = t(currentTool.value.title);
      const toolSubtitle = t(currentTool.value.subtitle);
      const toolDescription = t(currentTool.value.description);

      return {
        title: `${toolTitle} | ${appName.value}`,
        description: toolDescription,
        keywords: `${toolTitle}, ${toolSubtitle}, ${appName.value}`,
      };
    }

    // 默认或首页 Meta
    if (route.path === "/") {
      return {
        title: `${appName.value} | ${t("meta.home.title")}`,
        description: t("meta.home.description"),
        keywords: t("meta.home.keywords"),
      };
    }

    // 其他页面（如 /about, /search, /categories）
    const pathName = route.path.replace("/", "");
    let pageTitle = "";

    if (pathName === "categories") {
      pageTitle = t("nav.browseCategories");
    } else if (pathName === "search") {
      pageTitle = t("common.search");
    } else if (pathName === "about") {
      pageTitle = t("nav.about");
    } else if (pathName) {
      // 尝试直接翻译，如果找不到则不显示
      const key = `nav.${pathName}`;
      const translated = t(key);
      if (translated !== key) {
        pageTitle = translated;
      }
    }

    return {
      title: pageTitle ? `${pageTitle} | ${appName.value}` : appName.value,
      description: t("meta.home.description"),
      keywords: t("meta.home.keywords"),
    };
  });

  useHead({
    title: () => metaData.value.title,
    meta: [
      {
        name: "description",
        content: () => metaData.value.description,
      },
      {
        name: "keywords",
        content: () => metaData.value.keywords,
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1",
      },
    ],
    link: [
      {
        rel: "canonical",
        href: () => `https://tools.yule.ink${route.path}`,
      },
    ],
  });

  useSeoMeta({
    title: () => metaData.value.title,
    ogTitle: () => metaData.value.title,
    description: () => metaData.value.description,
    ogDescription: () => metaData.value.description,
    ogType: "website",
    twitterCard: "summary_large_image",
  });
}
