<script setup lang="ts">

import { onMounted, Ref, ref } from 'vue';
import { useGeoMap } from './../composables/useGeoMap';
import { GeoUtil, IGeoCoords } from './../../src/GeoUtil';
import { formatNumber } from './../formatters'

const { createMap } = useGeoMap();
const coords: Ref<IGeoCoords> = ref({ latitude: 0, longitude: 0 });
const geoMap = createMap();
const circles: { circle: SVGElement, coords: IGeoCoords }[] = [];
const distanceInKm = ref(0);
let centerCircle: SVGElement = geoMap.appendCircle(coords.value, 5);

const addLines = () => {
    for (let i: number = -85; i < 90; i += 5) {
        const coords1: IGeoCoords = { latitude: i, longitude: -180 };
        const coords2: IGeoCoords = { latitude: i, longitude: 180 };
        const distance = Math.round(GeoUtil.getGeoDistanceInMeters(coords1, coords2) / 1000);
        geoMap.appendText({latitude: i, longitude: -177}, `${distance}km`);
        geoMap.appendLine(coords1, coords2);
    }
}

const addCircle = (mouseEvent: MouseEvent) => {
    coords.value = geoMap.geoUtil.mapViewToGeoCoords({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
    const circle = geoMap.appendCircle(coords.value, 5);
    circles.push({ circle, coords: coords.value });
    if (circles.length == 1) return;
    if (circles.length > 2) {
        circles[0].circle.remove();
        circles.shift();
    }
    centerCircle.remove();
    const centerCoords = GeoUtil.getCenterOfCoords(circles[0].coords,circles[1].coords);
    centerCircle = geoMap.appendCircle(centerCoords, 5);
    distanceInKm.value = GeoUtil.getGeoDistanceInMeters(circles[0].coords, circles[1].coords) / 1000;
}

const clear = () => {
    geoMap.clear();
}


onMounted(() => {
    geoMap.configure({ containerId: 'map', imageSource: './assets/nasa_night_3600.jpg', width: 3600, height: 1800, enableDragToScroll: true });
});

</script>

<template>
    <div id="map" style="height: 600px; overflow: hidden;" @click="addCircle"></div>
    <div class="coords">
        <span>latitude: {{ formatNumber(coords.latitude, 9) }}</span>
        <span>longitude: {{ formatNumber(coords.longitude, 9) }}</span>
        <span style="width:200px;">distance km: {{ formatNumber(distanceInKm, 9) }}</span>
    </div>
    <div class="buttons">
        <button class="pure-button" @click="addLines">add distance lines</button>
        <button class="pure-button" @click="clear">clear map</button>
    </div>


</template>