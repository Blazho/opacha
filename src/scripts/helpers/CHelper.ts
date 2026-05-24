type Listener<T> = (data: T) => void;

export class Event<T> {
    private listeners: Listener<T>[] = [];

    subscribe(listener: Listener<T>) {
        this.listeners.push(listener);
    }

    unsubscribe(listener: Listener<T>) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    emit(data: T) {
        for (const listener of this.listeners) {
            listener(data);
        }
    }
}