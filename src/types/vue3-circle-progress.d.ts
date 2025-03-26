declare module 'vue3-circle-progress' {
  import { DefineComponent } from 'vue'
  export const CircleProgress: DefineComponent<{
    percent: number
    'border-width': number
    'border-bg-width': number
    'empty-color': string
    color: string[]
  }>
} 