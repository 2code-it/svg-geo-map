<script setup lang="ts">

import { onMounted, Ref, ref } from 'vue';
import { useGeoMap } from './../composables/useGeoMap';
import { IGeoCoords } from './../../src/GeoUtil';
import { formatNumber } from './../formatters';

const { createMap } = useGeoMap();
const coords: Ref<IGeoCoords> = ref({ latitude: 0, longitude: 0 });
const geoMap = createMap();
const center = (mouseEvent: MouseEvent) => {
    coords.value = geoMap.geoUtil.mapViewToGeoCoords({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
}


onMounted(() => {
    geoMap.configure({ containerId: 'map', imageSource: './assets/nasa_night_1600.jpg', width: 1600, height: 800, enableDragToScroll: false, startX: 200, startY: 100 });
});

</script>

<template>
    <div id="map" style="height: 600px; overflow: hidden;" @click="center"></div>
    <div class="coords">
        <span>latitude: {{ formatNumber(coords.latitude, 9) }}</span>
        <span>longitude: {{ formatNumber(coords.longitude, 9) }}</span>
    </div>

</template>