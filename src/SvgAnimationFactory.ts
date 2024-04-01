import { DomUtil } from './DomUtil';

export type SvgAnimationRestartOption = 'always' | 'whenNotActive' | 'never';

export interface IAnimationAttributeOptions {
    attributeName: string,
    begin?: number,
    end?: number,
    dur?: number,
    min?: number,
    max?: number,
    restart?: SvgAnimationRestartOption
    repeat?: number | string
    repeatDur?: number,
    values?: number[],
    keyTimes?: number[],
    keySplines?: number[][],
    repeatingKeySplines?: number[],
    from?: number,
    to?: number,
    by?: number
}


export class SvgAnimationFactory {
    constructor(svgElementTime: number, domUtil?: DomUtil) {
        this._startTime = Date.now() - Math.round(svgElementTime * 1000);
        this._domUtil = domUtil ?? new DomUtil();
    }

    private static _timeInSecondsOptions = ['begin', 'end', 'dur', 'min', 'max'];
    private _domUtil: DomUtil;
    private _startTime: number;

    public animateLine(line: SVGLineElement, duration = 5, removeAtEnd = false) {
        const attr = DomUtil.getElementAttributes(line, ['x1', 'y1', 'x2', 'y2']);
        const optionsArray: IAnimationAttributeOptions[] = [
            { attributeName: 'x2', from: attr.x1, to: attr.x2, dur: duration },
            { attributeName: 'y2', from: attr.y1, to: attr.y2, dur: duration }
        ];
        const animations = optionsArray.map(x => this.create(x));
        if (removeAtEnd) {
            animations[0].addEventListener('endEvent', (_) => { setTimeout(() => { line.remove(); }, 2000) });
        }
        animations.forEach(x => line.appendChild(x));
    }

    public create(options: IAnimationAttributeOptions): SVGAnimateElement {
        const attr = SvgAnimationFactory._getAttributesFromOptions(options, this._getCurrentTime());
        return <SVGAnimateElement>this._domUtil.createElementSvg('animate', attr);
    }

    private static _getAttributesFromOptions(options: IAnimationAttributeOptions, currentTime = 0): any {
        const begin = options.begin ?? Math.floor(currentTime / 100) / 10 - 0.2;
        const values: string | undefined = options.values != undefined ? options.values.map(x => x.toString()).join(';') : undefined;
        const keyTimes: string | undefined = options.keyTimes != undefined ? options.keyTimes.map(x => x.toString()).join(';') : undefined;
        let keySplines: string | undefined;
        if (options.keySplines != undefined) {
            keySplines = options.keySplines.map(x => x.map(y => y.toString()).join(' ')).join(';');
        }
        if (options.repeatingKeySplines != undefined) {
            if (options.keyTimes == undefined) throw new Error('Options repeatingKeySplines can only be used with keyTimes');
            keySplines = options.keyTimes.map(_ => options.repeatingKeySplines?.map(y => y.toString()).join(' ')).join(';');
        }

        const attr: any = { ...options, ...{ begin, values, keyTimes, keySplines } };
        if ('beginDelay' in attr) delete attr['beginDelay'];
        if ('repeatingKeySplines' in attr) delete attr['repeatingKeySplines'];

        SvgAnimationFactory._timeInSecondsOptions.forEach(x => { if (x in attr) attr[x] = `${attr[x]}s` });
        return attr;
    }

    private _getCurrentTime = () => Date.now() - this._startTime;
}