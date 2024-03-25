
export class SvgPathBuilder {

    constructor(path?: string, commandSeperator?: string) {
        this._commandSeperator = commandSeperator ?? '\n';
        if (path != undefined) {
            this._cmds = path.split(this._commandSeperator);
        }
    }

    private _cmds: string[] = [];
    private _commandSeperator: string;

    public get commands() {
        return this._cmds;
    }

    public moveTo(x: number, y: number): SvgPathBuilder {
        this._cmds.push(`M ${x},${y}`);
        return this;
    }

    public lineTo(x: number, y: number): SvgPathBuilder {
        this._cmds.push(`L ${x},${y}`);
        return this;
    }

    public horizontalLineTo(x: number): SvgPathBuilder {
        this._cmds.push(`H ${x}`);
        return this;
    }

    public verticalLineTo(y: number): SvgPathBuilder {
        this._cmds.push(`V ${y}`);
        return this;
    }

    public curveTo(x: number, y: number, cx1: number, cy1: number, cx2: number, cy2: number): SvgPathBuilder {
        this._cmds.push(`C ${cx1},${cy1} ${cx2},${cy2} ${x},${y}`);
        return this;
    }

    public smoothCurveTo(x: number, y: number, cx1: number, cy1: number): SvgPathBuilder {
        this._cmds.push(`S ${cx1},${cy1} ${x},${y}`);
        return this;
    }

    public quadraticCurveTo(x: number, y: number, cx1: number, cy1: number): SvgPathBuilder {
        this._cmds.push(`Q ${cx1},${cy1} ${x},${y}`);
        return this;
    }

    public smoothQuadraticCurveTo(x: number, y: number, cx1: number, cy1: number): SvgPathBuilder {
        this._cmds.push(`T ${cx1},${cy1} ${x},${y}`);
        return this;
    }

    public arcTo(x: number, y: number, radiusX: number, radiusY: number, angle: number = 0, isLargeArc: boolean = false, sweepClockWise: boolean = true): SvgPathBuilder {
        this._cmds.push(`T ${radiusX} ${radiusY} ${angle} ${isLargeArc ? 1 : 0} ${sweepClockWise ? 1 : 0} ${x},${y}`);
        return this;
    }

    public closePath(): SvgPathBuilder {
        this._cmds.push('Z');
        return this;
    }

    public clear() {
        this._cmds.splice(0, this._cmds.length);
    }

    public append(pathBuilder: SvgPathBuilder) {
        this._cmds.push(...pathBuilder.commands);
    }

    public toString() {
        return this._cmds.join('\n');
    }
}