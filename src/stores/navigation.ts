import { reactive } from "vue";

export const navigationStore = reactive({
  activeCategoryId: "",
});

export const setActiveCategory = (id: string) => {
  navigationStore.activeCategoryId = id;
};
