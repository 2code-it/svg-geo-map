import { expect, test, vi } from 'vitest'
import { JSDOM } from 'jsdom';
import { GeoMap } from '../src/GeoMap';
import { DomUtil } from '../src/DomUtil';

const getDoc = () => new JSDOM().window.document;

test('configure when specified containerId does not exist expect Error', () => {

    const domUtil = new DomUtil(getDoc());
    const geoMap = new GeoMap(undefined, undefined, domUtil);
    const options = GeoMap.getDefaultOptions();
    options.containerId = 'map';

    expect(() => geoMap.configure(options)).toThrowError();
});

test('configure when containerId is not null expect DomUtil.getElementById call', () => {
    const doc = getDoc();
    const domUtil = new DomUtil(doc);
    doc.body.appendChild(doc.createElement('div')).id = 'map';
    const geoMap = new GeoMap(undefined, undefined, domUtil);
    const options = GeoMap.getDefaultOptions();
    options.containerId = 'map';
    const spyGetElementById = vi.spyOn(domUtil, 'getElementById');

    geoMap.configure(options);

    expect(spyGetElementById).toHaveBeenCalledOnce();
});

test('enableDragToScroll when called expect DomUtil.enableDragToScroll call', () => {
    const domUtil = new DomUtil(getDoc());
    const geoMap = new GeoMap(undefined, undefined, domUtil);
    const spyDomUtilEnableDragToScroll = vi.spyOn(DomUtil, 'enableDragToScroll');

    geoMap.enableDragToScroll();

    expect(spyDomUtilEnableDragToScroll).toHaveBeenCalledOnce();
    expect(geoMap.svgElement.style.cursor).toBe('grab');
});

test('diableDragToScroll when called expect DomUtil.disableDragToScroll call', () => {
    const domUtil = new DomUtil(getDoc());
    const geoMap = new GeoMap(undefined, undefined, domUtil);
    const spyDomUtilDisableDragToScroll = vi.spyOn(DomUtil, 'disableDragToScroll');

    geoMap.disableDragToScroll();

    expect(spyDomUtilDisableDragToScroll).toHaveBeenCalledOnce();
    expect(geoMap.svgElement.style.cursor).toBe('default');
});