<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import { Moon, Sun, Monitor } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mode = useColorMode();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="h-9 w-9 rounded-xl hover:bg-secondary/80 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all active:scale-95 border-none"
      >
        <Sun
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500"
        />
        <Moon
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400"
        />
        <span class="sr-only">{{ $t("theme.toggle") }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      class="w-36 p-1.5 rounded-xl shadow-xl border-muted/50 backdrop-blur-lg"
    >
      <DropdownMenuItem
        @click="mode = 'light'"
        class="rounded-lg cursor-pointer flex items-center gap-2.5 py-2 px-3 focus:bg-amber-500/10 focus:text-amber-600 transition-colors"
      >
        <Sun class="h-4 w-4" />
        <span class="font-medium text-sm">{{ $t("theme.light") }}</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        @click="mode = 'dark'"
        class="rounded-lg cursor-pointer flex items-center gap-2.5 py-2 px-3 focus:bg-blue-500/10 focus:text-blue-500 transition-colors"
      >
        <Moon class="h-4 w-4" />
        <span class="font-medium text-sm">{{ $t("theme.dark") }}</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        @click="mode = 'auto'"
        class="rounded-lg cursor-pointer flex items-center gap-2.5 py-2 px-3 focus:bg-muted focus:text-foreground transition-colors border-t mt-1 pt-2"
      >
        <Monitor class="h-4 w-4 text-muted-foreground" />
        <span class="font-medium text-sm">{{ $t("theme.system") }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
