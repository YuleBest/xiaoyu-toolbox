import { reactive } from "vue";

export const navigationStore = reactive({
  activeCategoryId: "",
  isCollapsed: false,
});

export const setActiveCategory = (id: string) => {
  navigationStore.activeCategoryId = id;
};

export const toggleSidebar = () => {
  navigationStore.isCollapsed = !navigationStore.isCollapsed;
};
