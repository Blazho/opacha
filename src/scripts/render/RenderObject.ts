export abstract class GameObject {
    readonly id: string
    isActive: boolean = true
    abstract update(dt: number): void

    constructor(id: string) {
        this.id = id;
    }
}

export abstract class RenderObject extends GameObject{
    abstract render(context:CanvasRenderingContext2D):void;
}

export abstract class UIScreenObject extends RenderObject{
    abstract load(): void;
}