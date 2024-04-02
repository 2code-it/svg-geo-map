import { expect, test, vi } from 'vitest'
import { EventManager, EventListener2 } from '../src/EventManager'


type TestEvent = 'onbeforetest' | 'onaftertest';
class EventTester {
    constructor() {
        this._eventManager = new EventManager<EventTester, TestEvent>(this);
    }
    private _eventManager: EventManager<EventTester, TestEvent>;

    public addEventListener = (eventName: TestEvent, listener: EventListener2<EventTester>) => this._eventManager.addEventListener(eventName, listener);
    public removeEventListener = (eventName: TestEvent, listener: EventListener2<EventTester>) => this._eventManager.removeEventListener(eventName, listener);

    public test() {
        this._eventManager.raiseEvent('onbeforetest', { id: 'before' });
        this._eventManager.raiseEvent('onaftertest', { id: 'after' });
    }
}

test('addEventListener when listener added expect listener call when raised', () => {
    const tester = new EventTester();
    const listener: EventListener2<EventTester> = (eventArgs) => {
        return eventArgs['id'];
    };
    const mockListener = vi.fn(listener);
    tester.addEventListener('onbeforetest', mockListener);

    tester.test();

    expect(mockListener).toBeCalled();
    expect(mockListener).toHaveReturnedWith('before');
});

test('removeEventListener when listener added and removed expect no listener call when raised', () => {
    const tester = new EventTester();
    const listener: EventListener2<EventTester> = (eventArgs) => {
        return eventArgs['id'];
    };
    const mockListener = vi.fn(listener);
    tester.addEventListener('onbeforetest', mockListener);
    tester.removeEventListener('onbeforetest', mockListener);

    tester.test();

    expect(mockListener).toBeCalledTimes(0);
});