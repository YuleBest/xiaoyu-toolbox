<script setup lang="ts">
import { LayoutGrid, LayoutList } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toolLayout, setToolLayout } from '@/stores/layout'
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="h-9 w-9 rounded-xl hover:bg-secondary/80 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all active:scale-95 border-none"
      >
        <LayoutGrid v-if="toolLayout === 'grid'" class="h-[1.2rem] w-[1.2rem] text-cyan-500" />
        <LayoutList v-else class="h-[1.2rem] w-[1.2rem] text-blue-500" />
        <span class="sr-only">{{ $t('layout.label') }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      class="w-36 p-1.5 rounded-xl shadow-xl border-muted/50 backdrop-blur-lg"
    >
      <DropdownMenuItem
        class="rounded-lg cursor-pointer flex items-center gap-2.5 py-2 px-3 focus:bg-cyan-500/10 focus:text-cyan-600 transition-colors"
        @click="setToolLayout('grid')"
      >
        <LayoutGrid class="h-4 w-4" />
        <span class="font-medium text-sm">{{ $t('layout.grid') }}</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        class="rounded-lg cursor-pointer flex items-center gap-2.5 py-2 px-3 focus:bg-blue-500/10 focus:text-blue-500 transition-colors"
        @click="setToolLayout('list')"
      >
        <LayoutList class="h-4 w-4" />
        <span class="font-medium text-sm">{{ $t('layout.list') }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
