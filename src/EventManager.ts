
export interface IEventArgs<T> {
    source: T;
}

export type EventListener2<T> = (eventArgs: IEventArgs<T>) => void;

export class EventManager<Tsource, TeventName extends string>{
    public constructor(source: Tsource) {
        this._source = source;
    }

    private _events: { [key: string]: EventListener2<Tsource>[] } = {};
    private _source: Tsource;

    public addEventListener(eventName: TeventName, listener: EventListener2<Tsource>) {
        if (!(eventName in this._events)) this._events[eventName] = [];
        this._events[eventName].push(listener);
    }

    public removeEventListener(eventName: TeventName, listener: EventListener2<Tsource>) {
        if (!(eventName in this._events)) return;
        const fnIndex = this._events[eventName].indexOf(listener);
        if (fnIndex != -1) this._events[eventName].splice(fnIndex, 1);
    }

    public raiseEvent(eventName: TeventName, eventArgs: any) {
        if (!(eventName in this._events)) return;
        const args = { source: this._source, ...eventArgs };
        this._events[eventName].forEach(x => x(args));
    }
}
