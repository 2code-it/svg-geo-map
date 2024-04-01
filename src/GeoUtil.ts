
interface IGeoUtilInternalOptions {
    latitudeBegin: number,
    latitudeEnd: number,
    longitudeBegin: number,
    longitudeEnd: number,
    coordDegreePrecision: number,
    viewWidth: number,
    viewHeight: number
}

export interface IGeoUtilOptions {
    latitudeBegin?: number,
    latitudeEnd?: number,
    longitudeBegin?: number,
    longitudeEnd?: number,
    coordDegreePrecision?: number,
    viewWidth?: number,
    viewHeight?: number
}


const defaultGeoUtilOptions: IGeoUtilInternalOptions = {
    latitudeBegin: 90,
    latitudeEnd: -90,
    longitudeBegin: -180,
    longitudeEnd: 180,
    coordDegreePrecision: 1000000,
    viewWidth: 1,
    viewHeight: 1
};

export interface IGeoCoords {
    latitude: number,
    longitude: number
}

export interface IViewCoords {
    x: number,
    y: number
}

export class GeoUtil {

    public constructor(options?: IGeoUtilOptions) {
        this.configure(options ?? {});
    }

    private _options: IGeoUtilInternalOptions = GeoUtil.getDefaultOptions();
    private _totalDegreesLatitude = 0;
    private _totalDegreesLongitude = 0;
    private _degreesPerPixelX = 0;
    private _degreesPerPixelY = 0;
    private static _earthRadiusInMeters = 6378137;

    public static get earthRadiusInMeters() {
        return GeoUtil._earthRadiusInMeters;
    }

    public mapViewToGeoCoords(viewCoords: IViewCoords): IGeoCoords {
        this._throwOnInvalidViewCoords(viewCoords);

        const latitude = Math.round((this._options.latitudeBegin + this._degreesPerPixelY * viewCoords.y) * this._options.coordDegreePrecision) / this._options.coordDegreePrecision;
        const longitude = Math.round((this._options.longitudeBegin + this._degreesPerPixelX * viewCoords.x) * this._options.coordDegreePrecision) / this._options.coordDegreePrecision;

        return { latitude, longitude };
    }

    public mapGeoToViewCoords(geoCoords: IGeoCoords): IViewCoords {
        this._throwOnInvalidGeoCoords(geoCoords);

        const x = Math.round(((geoCoords.longitude - this._options.longitudeBegin) / this._totalDegreesLongitude) * this._options.viewWidth);
        const y = Math.round(((geoCoords.latitude - this._options.latitudeBegin) / this._totalDegreesLatitude) * this._options.viewHeight);

        return { x, y };
    }

    public getCenterOffset(geoCoords: IGeoCoords, width: number, height: number): IViewCoords {
        const viewCenterX = Math.round(width / 2);
        const viewCenterY = Math.round(height / 2);
        const viewCoords = this.mapGeoToViewCoords(geoCoords);
        return { x: viewCoords.x - viewCenterX, y: viewCoords.y - viewCenterY };
    }

    public static getCoordsOffsetByMeters(coords: IGeoCoords, offsetX: number, offsetY: number): IGeoCoords {
        const latitudeOffset = GeoUtil.getDegreesFromRadians(offsetY / GeoUtil.earthRadiusInMeters);
        const longitudeOffset = GeoUtil.getDegreesFromRadians(offsetX / (GeoUtil.earthRadiusInMeters * Math.cos(GeoUtil.getRadiansFromDegrees(coords.latitude))));
        return { latitude: coords.latitude + latitudeOffset, longitude: coords.longitude + longitudeOffset };
    }

    public static getCenterOfCoords(coords1: IGeoCoords, coords2: IGeoCoords): IGeoCoords {
        const radians1 = this.mapGeoCoordsToRadians(coords1);
        const radians2 = this.mapGeoCoordsToRadians(coords2);
        const hdiff = {
            latitude: (radians2.latitude - radians1.latitude) / 2,
            longitude: (radians2.longitude - radians1.longitude) / 2
        };

        const radianCoords = { latitude: radians1.latitude + hdiff.latitude, longitude: radians1.longitude + hdiff.longitude };
        return GeoUtil.mapRadiansToGeoCoords(radianCoords);
    }

    public static getGeoDistanceInMeters(coords1: IGeoCoords, coords2: IGeoCoords) {
        const radians1 = this.mapGeoCoordsToRadians(coords1);
        const radians2 = this.mapGeoCoordsToRadians(coords2);
        const hdiff = {
            latitude: (radians2.latitude - radians1.latitude) / 2,
            longitude: (radians2.longitude - radians1.longitude) / 2
        };

        const hsin = (x: number) => Math.pow(Math.sin(x / 2), 2);
        const a = hsin(hdiff.latitude) + Math.cos(radians1.latitude) * Math.cos(radians2.latitude) * hsin(hdiff.longitude);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return Math.round(GeoUtil.earthRadiusInMeters * c * 2);
    }

    public static getViewDistance = (viewCoords1: IViewCoords, viewCoords2: IViewCoords) =>
        Math.sqrt(Math.pow(viewCoords2.x - viewCoords1.x, 2) + Math.pow(viewCoords2.y - viewCoords1.y, 2));
    public static getDegreesFromRadians = (radians: number) => radians / (Math.PI / 180);
    public static getRadiansFromDegrees = (degrees: number) => degrees * (Math.PI / 180);

    public static mapRadiansToGeoCoords(radianCoords: IGeoCoords): IGeoCoords {
        return { latitude: GeoUtil.getDegreesFromRadians(radianCoords.latitude), longitude: GeoUtil.getDegreesFromRadians(radianCoords.longitude) };
    }

    public static mapGeoCoordsToRadians(coords: IGeoCoords): IGeoCoords {
        return { latitude: GeoUtil.getRadiansFromDegrees(coords.latitude), longitude: GeoUtil.getRadiansFromDegrees(coords.longitude) };
    }


    public getOptions(): IGeoUtilOptions {
        return { ...this._options };
    }

    public configure(options: IGeoUtilOptions) {
        const newOptions: IGeoUtilInternalOptions = { ...this._options, ...options };
        this._throwOnInvalidOptions(newOptions);
        this._options = newOptions;
        this._updateTotals(newOptions);
    }

    public static getDefaultOptions(): IGeoUtilInternalOptions {
        return { ...defaultGeoUtilOptions };
    }

    private _updateTotals(options: IGeoUtilInternalOptions) {
        this._totalDegreesLatitude = -options.latitudeBegin + options.latitudeEnd;
        this._totalDegreesLongitude = -options.longitudeBegin + options.longitudeEnd;
        this._degreesPerPixelX = this._totalDegreesLongitude / options.viewWidth;
        this._degreesPerPixelY = this._totalDegreesLatitude / options.viewHeight;
    }

    private _throwOnInvalidViewCoords(viewCoords: IViewCoords) {
        if (viewCoords.x < 0 || viewCoords.x > this._options.viewWidth)
            throw new Error(`X ${viewCoords.x} out of range 0-${this._options.viewWidth}`);

        if (viewCoords.y < 0 || viewCoords.y > this._options.viewHeight)
            throw new Error(`Y ${viewCoords.y} out of range 0-${this._options.viewHeight}`);
    }

    private _throwOnInvalidGeoCoords(geoCoords: IGeoCoords) {
        if (geoCoords.latitude > this._options.latitudeBegin || geoCoords.latitude < this._options.latitudeEnd)
            throw new Error(`Latitude out of range ${this._options.latitudeBegin}-${this._options.latitudeEnd}`);

        if (geoCoords.longitude < this._options.longitudeBegin || geoCoords.longitude > this._options.longitudeEnd)
            throw new Error(`Longitude out of range ${this._options.longitudeBegin}-${this._options.longitudeEnd}`);
    }

    private _throwOnInvalidOptions(options: IGeoUtilInternalOptions) {
        if (!GeoUtil._isBetween(options.latitudeBegin, -90, 90)) throw new Error(`Option latitudeBegin ${options.latitudeBegin} is out of range -90-90`);
        if (!GeoUtil._isBetween(options.latitudeEnd, -90, 90)) throw new Error(`Option latitudeEnd ${options.latitudeEnd} is out of range -90-90`);
        if (!GeoUtil._isBetween(options.longitudeBegin, -180, 180)) throw new Error(`Option longitudeBegin ${options.longitudeBegin} is out of range -180-180`);
        if (!GeoUtil._isBetween(options.longitudeEnd, -180, 180)) throw new Error(`Option longitudeEnd ${options.longitudeEnd} is out of range -180-180`);
        if (options.latitudeBegin <= options.latitudeEnd) throw new Error('Options latitudeBegin and latitudeEnd are not a valid range');
        if (options.longitudeBegin >= options.longitudeEnd) throw new Error('Options longitudeBegin and longitudeEnd are not a valid range');
        if (options.viewWidth <= 0) throw new Error('Option viewWidth is invalid');
        if (options.viewHeight <= 0) throw new Error('Option viewHeight is invalid');
    }

    private static _isBetween = (subject: number, min: number, max: number) => subject >= min && subject <= max;
}