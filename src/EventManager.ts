
export interface IEventArgs<T> {
    source: T;
}

export type eventListener<T> = (eventArgs: IEventArgs<T>) => void;

export class EventManager<T>{
    public constructor(source?: T, eventNames?: string[]) {
        if (source != undefined) this.source = source;
        if (eventNames != undefined) this.eventNames = eventNames;
    }

    private _events: { [key: string]: eventListener<T>[] } = {};
    public source: T;

    public get eventNames(): string[] {
        return Object.keys(this._events);
    }

    public set eventNames(value: string[]) {
        this._events = {};
        value.forEach(x => { this._events[x] = new Array<eventListener<T>>(); });
    }

    public addEventListener(eventName: string, listener: eventListener<T>) {
        this._throwOnUnknowEventName(eventName);
        this._events[eventName].push(listener);
    }

    public removeEventListener(eventName: string, listener: eventListener<T>) {
        this._throwOnUnknowEventName(eventName);
        const fnIndex = this._events[eventName].indexOf(listener);
        if (fnIndex != -1) this._events[eventName].splice(fnIndex, 1);
    }

    public raiseEvent(eventName: string, eventArgs: any) {
        this._throwOnUnknowEventName(eventName);
        const args = { source: this.source, ...eventArgs };
        this._events[eventName].forEach(x => x(args));
    }

    private _throwOnUnknowEventName(eventName: string) {
        if (!(eventName in this._events)) throw Error(`Unknown event name, available event names: ${Object.keys(this._events).join(',')}`);
    }
}