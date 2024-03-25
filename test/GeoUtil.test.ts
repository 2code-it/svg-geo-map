import { expect, test } from 'vitest'
import { GeoUtil, IViewCoords, IGeoUtilOptionalOptions } from '../src/GeoUtil';


test('configure when invalid option set expect error', () => {
    const geoUtil = new GeoUtil();

    expect(() => geoUtil.configure({ latitudeBegin: 95 })).toThrowError();
    expect(() => geoUtil.configure({ latitudeEnd: -101 })).toThrowError();
    expect(() => geoUtil.configure({ longitudeBegin: -202 })).toThrowError();
    expect(() => geoUtil.configure({ longitudeEnd: 200 })).toThrowError();
    expect(() => geoUtil.configure({ latitudeBegin: -30, latitudeEnd: 20 })).toThrowError();
    expect(() => geoUtil.configure({ longitudeBegin: -30, longitudeEnd: -180 })).toThrowError();
});

test('mapViewToGeoCoords when out of bounds coords parameters expect error', () => {
    const geoUtil = new GeoUtil({ viewWidth: 200, viewHeight: 200 });

    expect(() => geoUtil.mapViewToGeoCoords({ x: -1, y: 22 })).toThrowError();
    expect(() => geoUtil.mapViewToGeoCoords({ x: 204, y: 22 })).toThrowError();
    expect(() => geoUtil.mapViewToGeoCoords({ x: 45, y: -1 })).toThrowError();
    expect(() => geoUtil.mapViewToGeoCoords({ x: 40, y: 300 })).toThrowError();
});

test('mapViewToGeoCoords when full latitude and longitude at half width and height expect 0,0', () => {
    const options: IGeoUtilOptionalOptions = { viewWidth: 1000, viewHeight: 500, longitudeBegin: -180, longitudeEnd: 180, latitudeBegin: 90, latitudeEnd: -90 };
    const geoUtil = new GeoUtil(options);
    const viewCoords: IViewCoords = { x: options.viewWidth! / 2, y: options.viewHeight! / 2 };

    expect(geoUtil.mapViewToGeoCoords(viewCoords).latitude).toBe(0);
    expect(geoUtil.mapViewToGeoCoords(viewCoords).longitude).toBe(0);
});

test('mapViewToGeoCoords when offset coords expect offset increment by coords', () => {
    const options: IGeoUtilOptionalOptions = { viewWidth: 100, viewHeight: 100, longitudeBegin: -60, longitudeEnd: 40, latitudeBegin: 30, latitudeEnd: -70 };
    const geoUtil = new GeoUtil(options);
    const viewCoords: IViewCoords = { x: 43, y: 22 };

    expect(geoUtil.mapViewToGeoCoords(viewCoords).longitude).toBe(options.longitudeBegin! + viewCoords.x);
    expect(geoUtil.mapViewToGeoCoords(viewCoords).latitude).toBe(options.latitudeBegin! - viewCoords.y);
});

test('mapGeoToViewCoords when out of bounds coords parameters expect error', () => {
    const geoUtil = new GeoUtil({ latitudeBegin: 40, latitudeEnd: -40, longitudeBegin: -40, longitudeEnd: 40 });

    expect(() => geoUtil.mapGeoToViewCoords({ latitude: -50, longitude: 22 })).toThrowError();
    expect(() => geoUtil.mapGeoToViewCoords({ latitude: 50, longitude: 22 })).toThrowError();
    expect(() => geoUtil.mapGeoToViewCoords({ latitude: 45, longitude: -50 })).toThrowError();
    expect(() => geoUtil.mapGeoToViewCoords({ latitude: 45, longitude: 50 })).toThrowError();
});

test('getViewDistance when 2 pixels on the same axis expect subtraction result', () => {
    const viewCoords1: IViewCoords = { x: 0, y: 201 };
    const viewCoords2: IViewCoords = { x: 0, y: 108 };

    expect(GeoUtil.getViewDistance(viewCoords1, viewCoords2)).toBe(viewCoords1.y - viewCoords2.y);
    expect(GeoUtil.getViewDistance(viewCoords2, viewCoords1)).toBe(viewCoords1.y - viewCoords2.y);
});