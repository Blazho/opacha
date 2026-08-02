export abstract class GameObject {
    readonly id: string
    abstract update(dt: number): void

    constructor(id: string) {
        this.id = id;
    }
}

export abstract class RenderObject extends GameObject{
    abstract render(context:CanvasRenderingContext2D):void;
}

