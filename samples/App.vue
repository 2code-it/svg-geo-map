<script setup lang="ts">

import { ref, computed, Ref } from 'vue'
import { useGeoMap } from './composables/useGeoMap'

import NotFoundPage from './components/NotFoundPage.vue'
import HomePage from './components/HomePage.vue'
import CenterMapPage from './components/CenterMapPage.vue'
import BasicShapesPage from './components/BasicShapesPage.vue'
import HaversinePage from './components/HaversinePage.vue'
import PathBuilderPage from './components/PathBuilderPage.vue'



const { configure } = useGeoMap();
configure({
  imageSource: './assets/nasa_night_1600.jpg',
  width: 1600,
  height: 800
});

const routes: { [key: string]: any } = {
  '/': HomePage,
  'center-map': CenterMapPage,
  'basic-shapes': BasicShapesPage,
  'haversine': HaversinePage,
  'path-builder': PathBuilderPage
};

const currentPath: Ref<string> = ref(window.location.hash);

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || NotFoundPage
});
</script>

<template>
  <header>

  </header>

  <main>
    <component :is="currentView" />
  </main>
</template>
