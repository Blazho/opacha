import {UniqueSet} from "../helpers/UniqueSet";
//todo singleton, render components, layering
export class RenderEngine{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private renderObjects: UniqueSet<RenderObject, "id">;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get Canvas 2D context.");
        }
        this.ctx = context;
        this.renderObjects = new UniqueSet("id");
    }

    public addRenderObject(renderObject: RenderObject){
        this.renderObjects.add(renderObject);
    }

    public removeRenderObject(renderObject: RenderObject){
        this.renderObjects.delete(renderObject.id);
    }

    public render(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        for(const [_, renderObject] of this.renderObjects.entries()){
            renderObject.render(this.ctx)
        }
    }
}