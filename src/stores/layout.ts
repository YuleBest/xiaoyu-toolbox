import { useStorage } from '@vueuse/core'

export type ToolLayout = 'grid' | 'list'

export const toolLayout = useStorage<ToolLayout>('xiaoyu_tool_layout', 'grid')

export const setToolLayout = (layout: ToolLayout) => {
  toolLayout.value = layout
}
