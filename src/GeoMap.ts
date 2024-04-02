import { GeoUtil, IGeoUtilOptions, IGeoCoords } from './GeoUtil';
import { EventManager, EventListener2 } from './EventManager';
import { DomUtil } from './DomUtil';
import { SvgShapeFactory } from './SvgShapeFactory';
import { SvgAnimationFactory } from './SvgAnimationFactory';


export interface IGeoMapOptions {
    width?: number,
    height?: number,
    startX?: number,
    startY?: number,
    containerId?: string,
    imageSource?: string,
    enableDragToScroll?: boolean,
    geoUtilOptions?: IGeoUtilOptions
};

const defaultGeoMapOptions: IGeoMapOptions = {
    width: 2048,
    height: 1024,
    enableDragToScroll: true,
    geoUtilOptions: GeoUtil.getDefaultOptions()
};

type GeoMapEvent = 'beforeappendshape' | 'afterappendshape';

export class GeoMap {

    constructor(options?: IGeoMapOptions, geoUtil?: GeoUtil, domUtil?: DomUtil, svgShapeFactory?: SvgShapeFactory, eventManager?: EventManager<GeoMap, GeoMapEvent>) {
        this._geoUtil = geoUtil ?? new GeoUtil();
        this._domUtil = domUtil ?? new DomUtil();
        this._svgShapeFactory = svgShapeFactory ?? new SvgShapeFactory(this._domUtil, this.geoUtil);
        this._eventManager = eventManager ?? new EventManager<GeoMap, GeoMapEvent>(this);
        this._svgElement = this._createSvgElement();
        this.configure(options ?? GeoMap.getDefaultOptions());
    }

    private _geoUtil: GeoUtil;
    private _domUtil: DomUtil;
    private _eventManager: EventManager<GeoMap, GeoMapEvent>;
    private _svgShapeFactory: SvgShapeFactory;
    private _options: IGeoMapOptions = GeoMap.getDefaultOptions();

    private _svgVersion = '1.1';
    private _svgElement: SVGSVGElement;

    public get svgVersion() {
        return this._svgVersion;
    }

    public get svgElement() {
        return this._svgElement;
    }

    public get geoUtil() {
        return this._geoUtil;
    }

    public get svgShapeFactory() {
        return this._svgShapeFactory;
    }

    public get options() {
        return this._options;
    }

    public appendLine = (coords1: IGeoCoords, coords2: IGeoCoords, pathLength?: number, attr?: any) =>
        this.appendShape(this._svgShapeFactory.createLine(coords1, coords2, pathLength, attr));

    public appendCircle = (coords: IGeoCoords, radius: number, pathLength?: number, attr?: any) =>
        this.appendShape(this._svgShapeFactory.createCircle(coords, radius, pathLength, attr));

    public appendEllipse = (coords: IGeoCoords, radiusX: number, radiusY: number, pathLength?: number, attr?: any) =>
        this.appendShape(this._svgShapeFactory.createEllipse(coords, radiusX, radiusY, pathLength, attr));

    public appendRect = (coords: IGeoCoords, width: number, height: number, cornerRadiusX?: number, cornerRadiusY?: number, pathLength?: number, attr?: any) =>
        this.appendShape(this._svgShapeFactory.createRect(coords, width, height, cornerRadiusX, cornerRadiusY, pathLength, attr));

    public appendText = (coords: IGeoCoords, text: string, rotate?: number, lengthAdjust?: number, textLength?: number, attr?: any) =>
        this.appendShape(this._svgShapeFactory.createText(coords, text, rotate, lengthAdjust, textLength, attr));

    public appendImage = (coords: IGeoCoords, href: string, width?: number, height?: number, preserveAspectRatio?: boolean, attr?: any) =>
        this.appendShape(this._svgShapeFactory.createImage(coords, href, width, height, preserveAspectRatio, attr));

    public appendForeignObject = (coords: IGeoCoords, width: number, height: number, foreignElement: Node, attr?: any) =>
        this.appendShape(this._svgShapeFactory.createForeignObject(coords, width, height, foreignElement, attr));

    public appendPolygon = (coords: IGeoCoords[], pathLength?: number, attr?: any) =>
        this.appendShape(this._svgShapeFactory.createPolygon(coords, pathLength, attr));

    public appendPolyLine = (coords: IGeoCoords[], pathLength?: number, attr?: any) =>
        this.appendShape(this._svgShapeFactory.createPolyLine(coords, pathLength, attr));

    public appendShape(shape: SVGElement) {
        this._eventManager.raiseEvent('beforeappendshape', { shape });
        this._svgElement.appendChild(shape);
        this._eventManager.raiseEvent('afterappendshape', { shape });
        return shape;
    }

    public appendNewShape(name: string, attr: any, coordsArray: IGeoCoords[]) {
        const shape = this._svgShapeFactory.createShape(name, attr, coordsArray);
        this.appendShape(shape);
    }

    public setImageSource(imageSource: string) {
        this._svgElement.style.backgroundImage = `url("${imageSource}")`;
        this._options.imageSource = imageSource;
    }

    public center(geoCoords: IGeoCoords) {
        if (this._svgElement.parentElement == null) throw new Error('Map not rendered to a container');
        const parentElement = this._svgElement.parentElement!;
        const centered = this._geoUtil.getCenterOffset(geoCoords, parentElement.offsetWidth, parentElement.offsetHeight);
        this._svgElement.parentElement.scrollTo(centered.x, centered.y);
    }

    public configure(options: IGeoMapOptions) {

        if (options.geoUtilOptions != undefined) {
            this._geoUtil.configure(options.geoUtilOptions);
        }

        this.resize(options.width, options.height);

        if (options.imageSource != undefined) {
            this.setImageSource(options.imageSource);
        }

        if (options.containerId != undefined) {
            this.renderTo(options.containerId, options.startX, options.startY);
        }

        if (options.enableDragToScroll != undefined) {
            if (options.enableDragToScroll) {
                this.enableDragToScroll();
            }
            else {
                this.disableDragToScroll();
            }
        }
    }

    public resize(width?: number, height?: number) {
        if (width == undefined && height == undefined) return;
        const geoOptions = this._geoUtil.getOptions();

        if (width != undefined) {
            geoOptions.viewWidth = width;
            this._svgElement.style.width = `${width}px`;
        }
        if (height != undefined) {
            geoOptions.viewHeight = height;
            this._svgElement.style.height = `${height}px`;
        }

        this._geoUtil.configure(geoOptions);
    }

    public clear() {
        while (this._svgElement.firstChild != null) {
            this._svgElement.firstChild.remove();
        }
    }

    public remove() {
        this._svgElement.remove();
    }

    public renderTo(containerId: string, startX = 0, startY = 0) {
        const targetElement = this._domUtil.getElementById(containerId);
        if (targetElement == null) throw new Error(`Element '${containerId}' not found`);
        if (this._svgElement.parentNode != null) {
            this._svgElement.remove();
        }
        targetElement.style.position = 'relative';
        targetElement.style.padding = '0px';
        targetElement.appendChild(this._svgElement);
        if (startX != 0 || startY != 0) {
            targetElement.scrollBy(startX, startY);
        }
        this._options.containerId = containerId;
    }

    public enableDragToScroll = () => DomUtil.enableDragToScroll(this._svgElement);
    public disableDragToScroll = () => DomUtil.disableDragToScroll(this._svgElement);
    public addEventListener = (eventName: GeoMapEvent, listener: EventListener2<GeoMap>) => this._eventManager.addEventListener(eventName, listener);
    public removeEventListener = (eventName: GeoMapEvent, listener: EventListener2<GeoMap>) => this._eventManager.removeEventListener(eventName, listener);
    public createAnimationFactory() {
        return new SvgAnimationFactory(this._svgElement.getCurrentTime());
    }

    public static getDefaultOptions() {
        return { ...defaultGeoMapOptions };
    }

    private _createSvgElement() {
        const svgElement = <SVGSVGElement>this._domUtil.createElementSvg('svg', { version: this.svgVersion });
        svgElement.style.background = 'top left no-repeat contain';
        svgElement.style.padding = svgElement.style.margin = '0px';
        return svgElement;
    }
}