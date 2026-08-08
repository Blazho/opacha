
export abstract class UIScreen{
    public readonly id: string
    public isActive: boolean = false;

    protected constructor(id: string){
        this.id = id;
    }

    public abstract render(ctx: CanvasRenderingContext2D):void;
}