<script setup lang="ts">
import { Languages, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from 'vue-i18n'
import { setLanguage, supportedLocales, type SupportedLocale } from '@/i18n'

const { locale } = useI18n()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="h-9 w-9 rounded-xl hover:bg-secondary/80 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all active:scale-95 border-none"
      >
        <Languages class="h-[1.2rem] w-[1.2rem] scale-100 transition-all text-blue-500" />
        <span class="sr-only">{{ $t('lang.label') }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      class="w-40 p-2 rounded-2xl shadow-2xl border-muted/50 backdrop-blur-2xl bg-background/95 z-70"
    >
      <DropdownMenuItem
        v-for="l in supportedLocales"
        :key="l.code"
        class="rounded-xl cursor-pointer flex items-center justify-between py-2.5 px-3 transition-colors mb-0.5 last:mb-0"
        :class="
          locale === l.code
            ? 'bg-blue-500/10 text-blue-500'
            : 'focus:bg-muted focus:text-foreground'
        "
        @click="setLanguage(l.code as SupportedLocale)"
      >
        <span class="font-semibold text-sm">{{ l.label }}</span>
        <Check v-if="locale === l.code" class="h-3.5 w-3.5" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
