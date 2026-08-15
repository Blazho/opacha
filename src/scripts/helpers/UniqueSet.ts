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

    addAll(items: UniqueSet<T, K>) {
        for(const [_, item] of items.entries()) {
            this.add(item)
        }
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

    containInAnyKey(value: string): boolean {
        for(const [key, _] of this.items.entries()) {
            if((""+key).includes(value.toString())){
                return true
            }
        }
        return false
    }

    toList(): T[]{
        const list: T[] = []
        for(const item of this.items.values()){
            list.push(item)
        }
        return list
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