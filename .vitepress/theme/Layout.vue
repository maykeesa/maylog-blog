<script setup lang="ts">
import { Content } from 'vitepress'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <div class="wrap">
    <SiteHeader />
    <main>
      <Content />
    </main>
    <SiteFooter />
  </div>
</template>
