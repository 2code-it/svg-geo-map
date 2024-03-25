import { expect, test, vi } from 'vitest'
import { SvgShapeFactory } from '../src/SvgShapeFactory';
import { GeoUtil, IGeoCoords } from '../src/GeoUtil';
import { DomUtil } from '../src/DomUtil';
import { JSDOM } from 'jsdom';

const getDoc = () => new JSDOM().window.document;
const testCoords: IGeoCoords[] = [{ latitude: 20, longitude: -20 }, { latitude: 22, longitude: -22 }];
const geoUtil = new GeoUtil({ viewWidth: 1200, viewHeight: 600 });

test('createShape when shape unsupported expect error', () => {
    const domUtil = new DomUtil(getDoc());
    const factory = new SvgShapeFactory(domUtil, geoUtil);

    expect(() => factory.createShape('testshape', {}, testCoords)).toThrowError();
});


test('createShape when create circle expect cx,cy,r properties set', () => {
    const domUtil = new DomUtil(getDoc());
    const factory = new SvgShapeFactory(domUtil, geoUtil);
    const geoCoords: IGeoCoords = { latitude: 20, longitude: 20 };
    const viewCoords = geoUtil.mapGeoToViewCoords(geoCoords);
    const r = 10;
    const circle = factory.createShape('circle', { r }, [geoCoords]);

    expect(circle.getAttribute('r')).toBe(r.toString());
    expect(circle.getAttribute('cx')).toBe(viewCoords.x.toString());
    expect(circle.getAttribute('cy')).toBe(viewCoords.y.toString());
});