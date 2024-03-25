import { GeoUtil, IGeoCoords, IViewCoords } from "./GeoUtil";
import { DomUtil } from "./DomUtil";


type attributeViewCoordsMerger = (attr: any, coords: IViewCoords[]) => any;


export class SvgShapeFactory {
    constructor(domUtil?: DomUtil, geoUtil?: GeoUtil) {
        this._domUtil = domUtil ?? new DomUtil();
        this._geoUtil = geoUtil ?? new GeoUtil();
    }

    private _domUtil: DomUtil;
    private _geoUtil: GeoUtil;

    private _attributeMergers: { [key: string]: attributeViewCoordsMerger } = {
        'line': (attr, coords) => {
            const attrPixels = { x1: coords[0].x, y1: coords[0].y, x2: coords[1].x, y2: coords[1].y };
            return { ...attr, ...attrPixels };
        },
        'circle': (attr, coords) => {
            const attrPixels = { cx: coords[0].x, cy: coords[0].y };
            return { ...attr, ...attrPixels };
        },
        'ellipse': (attr, coords) => this._attributeMergers['circle'](attr, coords),
        'rect': (attr, coords) => {
            const attrPixels = { x: coords[0].x, y: coords[0].y };
            return { ...attr, ...attrPixels };
        },
        'text': (attr, coords) => this._attributeMergers['rect'](attr, coords),
        'image': (attr, coords) => this._attributeMergers['rect'](attr, coords),
        'foreignObject': (attr, coords) => this._attributeMergers['rect'](attr, coords),
        'polygon': (attr, coords) => {
            const attrPixels = { points: coords.map(p => `${p.x},${p.y}`).join(' ') };
            return { ...attr, ...attrPixels };
        },
        'polyline': (attr, coords) => this._attributeMergers['polygon'](attr, coords),
    };

    public createLine(goeCoords1: IGeoCoords, geoCoords2: IGeoCoords, pathLength?: number, attr?: any) {
        const coords = [goeCoords1, geoCoords2];
        const attrNew = { ...attr, ...{ pathLength } };
        return <SVGLineElement>this.createShape('line', attrNew, coords);
    }

    public createCircle(geoCoords: IGeoCoords, radius: number, pathLength?: number, attr?: any) {
        const attrNew = { ...attr, ...{ r: radius, pathLength } };
        return <SVGCircleElement>this.createShape('circle', attrNew, [geoCoords]);
    }

    public createEllipse(geoCoords: IGeoCoords, radiusX: number, radiusY: number, pathLength?: number, attr?: any) {
        const attrNew = { ...attr, ...{ rx: radiusX, ry: radiusY, pathLength } };
        return <SVGEllipseElement>this.createShape('ellipse', attrNew, [geoCoords]);
    }

    public createRect(geoCoords: IGeoCoords, width: number, height: number, cornerRadiusX?: number, cornerRadiusY?: number, pathLength?: number, attr?: any) {
        const attrNew = { ...attr, ...{ width, height, rx: cornerRadiusX, ry: cornerRadiusY, pathLength } };
        return <SVGRectElement>this.createShape('rect', attrNew, [geoCoords]);
    }

    public createText(geoCoords: IGeoCoords, text: string, rotate?: number, lengthAdjust?: number, textLength?: number, attr?: any) {
        const attrNew = { ...attr, ...{ rotate, lengthAdjust, textLength } };
        const shape = this.createShape('text', attrNew, [geoCoords]);
        shape.innerHTML = text;
        return <SVGTextElement>shape;
    }

    public createImage(geoCoords: IGeoCoords, href: string, width?: number, height?: number, preserveAspectRatio?: boolean, attr?: any) {
        const attrNew = { ...attr, ...{ href, width, height, preserveAspectRatio } };
        return <SVGImageElement>this.createShape('image', attrNew, [geoCoords]);
    }

    public createForeignObject(geoCoords: IGeoCoords, width: number, height: number, foreignNode: Node, attr?: any) {
        const attrNew = { ...attr, ...{ width, height } };
        const shape = this.createShape('foreignObject', attrNew, [geoCoords]);
        shape.appendChild(foreignNode);
        return <SVGForeignObjectElement>shape;
    }

    public createPolygon(coordsArray: IGeoCoords[], pathLength?: number, attr?: any) {
        const attrNew = { ...attr, ...{ pathLength } };
        return <SVGPolygonElement>this.createShape('polygon', attrNew, coordsArray);
    }

    public createPolyLine(coordsArray: IGeoCoords[], pathLength?: number, attr?: any) {
        const attrNew = { ...attr, ...{ pathLength } };
        return <SVGPolylineElement>this.createShape('polyline', attrNew, coordsArray);
    }

    public createShape(name: string, attr: any, coordsArray: Array<IGeoCoords>) {
        this._throwOnNotSupportedShape(name);
        const viewCoords = coordsArray.map(x => this._geoUtil.mapGeoToViewCoords(x));
        //const attrWithDefaults = {...this.#defaultAttr, ...attr};
        const attrMerged = this._attributeMergers[name](attr, viewCoords);
        return this._domUtil.createElementSvg(name, attrMerged);
    }

    private _throwOnNotSupportedShape(name: string) {
        if (!(name in this._attributeMergers)) throw new Error(`Shape '${name}' not supported`);
    }
}