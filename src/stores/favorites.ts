import { useStorage } from "@vueuse/core";

export const favoriteIds = useStorage<string[]>("xiaoyu_favorite_tools", []);

export const toggleFavorite = (id: string) => {
  const index = favoriteIds.value.indexOf(id);
  if (index > -1) {
    favoriteIds.value.splice(index, 1);
  } else {
    favoriteIds.value.push(id);
  }
};

export const isFavorite = (id: string) => {
  return favoriteIds.value.includes(id);
};
