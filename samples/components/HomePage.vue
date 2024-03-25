<script setup lang="ts">

import { Ref, ref, watch, onMounted, onUnmounted } from 'vue';
import { useGeoMap } from './../composables/useGeoMap';
import { GeoUtil, IGeoCoords, IViewCoords } from './../../src/GeoUtil';
import { formatNumber } from './../formatters'

const { createMapContext } = useGeoMap();
const geoMapContext = createMapContext();
const animationFactory = geoMapContext.map.createAnimationFactory();
const geoCoords: Ref<IGeoCoords> = ref({ latitude: 0, longitude: 0 });
const viewCoords: Ref<IViewCoords> = ref({ x: 0, y: 0 });
let timer: number;

watch(viewCoords, () => {
    geoCoords.value = geoMapContext.map.geoUtil.mapViewToGeoCoords(viewCoords.value);
});

function drawRandomAnimatedLines() {
    const coord1 = getRandomGeoCoord();
    const coord2 = getRandomGeoCoord();
    const distanceInKm = Math.round(GeoUtil.getGeoDistanceInMeters(coord1, coord2) / 1000);
    const durationInSeconds = Math.ceil(distanceInKm / 1000);

    const line = geoMapContext.map.svgShapeFactory.createLine(coord1, coord2);
    animationFactory.animateLine(line, durationInSeconds, true);
    geoMapContext.map.appendShape(line);
    timer = setTimeout(() => { drawRandomAnimatedLines() }, 2000 + Math.random() * 2000);
};

function getRandomGeoCoord() {
    return { latitude: Math.random() * 180 - 90, longitude: Math.random() * 360 - 180 };
}


onMounted(() => {
    geoMapContext.map.clear();
    geoMapContext.map.configure({ containerId: 'map', imageSource: './assets/nasa_night_1600.jpg', width: 1600, height: 800, enableDragToScroll: true });
    geoMapContext.enableMouseMoveTracking(viewCoords);
    drawRandomAnimatedLines();
});

onUnmounted(() => {
    geoMapContext.disableMouseMoveTracking();
    clearTimeout(timer);
});

</script>

<template>
    <div id="map" style="height: 600px; overflow: hidden;"></div>
    <div class="coords">
        <span>latitude: {{ formatNumber(geoCoords.latitude, 9) }}</span>
        <span>longitude: {{ formatNumber(geoCoords.longitude, 9) }}</span>
        <span>x: {{ viewCoords.x }}</span>
        <span>y: {{ viewCoords.y }}</span>
    </div>
</template>
