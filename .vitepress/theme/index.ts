import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import './styles/tokens.css'
import './styles/base.css'

/* Tema 100% próprio: não herda nada do tema padrão do VitePress. */
export default {
  Layout
} satisfies Theme
