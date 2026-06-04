export class UniqueSet<T, K extends keyof T> {
    private items = new Map<T[K], T>();

    constructor(private idKey: K) {}

    add(item: T) {
        if(!isRealObject(item)) {
            return
        }

        const idValue = item[this.idKey];
        if(!idValue) {
            return;
        }
        this.items.set(idValue, item);
    }

    get(id: T[K]) {
        return this.items.get(id);
    }

    has(id: T[K]) {
        return this.items.has(id);
    }

    delete(id: T[K]) {
        this.items.delete(id);
    }

    entries(): MapIterator<[T[K], T]> {
        return this.items.entries()
    }

    clear(){
        this.items.clear()
    }

    length():number {
        return this.items.size
    }

    public toString(){
        let string = '[UniqueSet]: [\n'
        for(const [key, value] of this.items.entries()) {
            string += `\t{${key}: ${JSON.stringify(value)}}\n`
        }
        string += ']'

        return string
    }
}

function isRealObject(val: any): val is object {
    return (
        val !== null &&
        typeof val === 'object'
    );
}

