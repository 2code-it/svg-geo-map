
import { Ref } from 'vue';
import { GeoMap, IGeoMapOptions } from '../../src/GeoMap';
import { GeoUtil, IViewCoords } from '../../src/GeoUtil';


const _geoMapOptions = GeoMap.getDefaultOptions();

export class GeoMapContext {
    constructor(geoMap: GeoMap) {
        this._geoMap = geoMap;
    }

    private _geoMap: GeoMap;
    private _mouseMoveViewCoords: Ref<IViewCoords> | null = null;

    public get map() {
        return this._geoMap;
    }

    public enableMouseMoveTracking(viewCoords: Ref<IViewCoords>) {
        this._mouseMoveViewCoords = viewCoords;
        this._geoMap.svgElement.addEventListener('mousemove', this._mouseMoveEventListener);
    }

    public disableMouseMoveTracking() {
        this._geoMap.svgElement.removeEventListener('mousemove', this._mouseMoveEventListener);
        this._mouseMoveViewCoords = null;
    }

    private _mouseMoveEventListener = ((event: MouseEvent) => {
        if (this._mouseMoveViewCoords == null) return;
        this._mouseMoveViewCoords.value = { x: event.offsetX, y: event.offsetY }
    }).bind(this);
}

export function useGeoMap() {

    function getDefaultMapOptions() {
        return GeoMap.getDefaultOptions();
    }

    function getDefaultGeoUtilOptions() {
        return GeoUtil.getDefaultOptions();
    }

    function configure(options: IGeoMapOptions) {
        Object.assign(_geoMapOptions, options);
    }

    function createMap(options?: IGeoMapOptions) {
        const mergedOptions = { ..._geoMapOptions, ...options };
        return new GeoMap(mergedOptions);
    }

    function createMapContext(options?: IGeoMapOptions) {
        const geoMap = createMap(options);
        return new GeoMapContext(geoMap);
    }

    return {
        getDefaultMapOptions,
        getDefaultGeoUtilOptions,
        configure,
        createMap,
        createMapContext
    };
}