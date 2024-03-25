

export class DomUtil {

    public constructor(document?: Document) {
        this._document = document ?? window.document;
    }

    private _document: Document;
    private static _svgNs = 'http://www.w3.org/2000/svg';

    public get svgNs() {
        return DomUtil._svgNs;
    }

    public createElementSvg(elementName: string, attr: any) {
        const element = <SVGElement>this._document.createElementNS(this.svgNs, elementName);
        DomUtil.setElementAttributes(element, attr);
        return element;
    }

    public createElement(elementName: string, attr: any) {
        const element = this._document.createElement(elementName);
        DomUtil.setElementAttributes(element, attr);
        return element;
    }

    public getElementById = (id: string) => this._document.getElementById(id);

    public static getElementAttributes(element: HTMLElement | SVGElement, attributeNames: string[]): any {
        const attr: { [key: string]: string } = {};
        attributeNames.forEach(x => {
            const value = element.getAttribute(x);
            if (value == null) return;
            attr[x] = value;
        });

        return attr;
    }

    public static setElementAttributes(element: HTMLElement | SVGElement, attr: any) {
        for (let key in attr) {
            if (attr[key] == null) continue;
            element.setAttribute(key, attr[key]);
        }
    }

    public static enableDragToScroll(element: HTMLElement | SVGElement) {
        if (element.style.cursor == 'grab') return;
        element.style.cursor = 'grab';
        element.addEventListener('mousedown', <EventListener>DomUtil.onMouseDownDragToScroll);
        element.addEventListener('mousemove', <EventListener>DomUtil.onMouseMoveDragToScroll);
        element.addEventListener('mouseup', <EventListener>DomUtil.onMouseUpDragToScroll);
        element.addEventListener('mouseleave', <EventListener>DomUtil.onMouseLeaveDragToScroll);
    }

    public static disableDragToScroll(element: HTMLElement | SVGElement) {
        if (element.style.cursor != 'grab') return;
        element.style.cursor = 'default';
        element.removeEventListener('mousedown', <EventListener>DomUtil.onMouseDownDragToScroll);
        element.removeEventListener('mousemove', <EventListener>DomUtil.onMouseMoveDragToScroll);
        element.removeEventListener('mouseup', <EventListener>DomUtil.onMouseUpDragToScroll);
        element.removeEventListener('mouseleave', <EventListener>DomUtil.onMouseLeaveDragToScroll);
    }

    private static onMouseDownDragToScroll(event: MouseEvent) {
        const element = (<HTMLElement>event.target);
        element.style.cursor = 'grabbing';
        event.preventDefault();
    }

    private static onMouseMoveDragToScroll(event: MouseEvent) {
        const element = (<HTMLElement>event.target);
        if (element.style.cursor != 'grabbing') return;
        element.parentElement!.scrollBy(-event.movementX, -event.movementY);
    }

    private static onMouseUpDragToScroll(event: MouseEvent) {
        const element = (<HTMLElement>event.target);
        element.style.cursor = 'grab';
    }

    private static onMouseLeaveDragToScroll = (event: MouseEvent) => DomUtil.onMouseUpDragToScroll(event);
}