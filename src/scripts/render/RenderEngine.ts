import {UniqueSet} from "../helpers/UniqueSet.js";
import {RenderObject} from "./RenderObject.js";
import {SCREENS} from "../config/constants.js";
//todo layering
export class RenderEngine{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private renderObjects: UniqueSet<RenderObject, "id">;
    private static instance: RenderEngine | null = null

    private constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        const context = canvas.getContext("2d")
        if(!context){
            throw new Error("[RenderEngine] Can not get context from canvas element")
        }
        this.ctx = context
        this.renderObjects = new UniqueSet<RenderObject, "id">("id")
    }

    public static init(canvas: HTMLCanvasElement){
        if(RenderEngine.instance){
            throw new Error("RenderEngine already initialized")
        }
        RenderEngine.instance = new RenderEngine(canvas)
        return RenderEngine.instance
    }

    public static getInstance(){
        if(!RenderEngine.instance){
            throw new Error("[RenderEngine] must be initialized with init before calling getInstance")
        }
        return RenderEngine.instance
    }

    public setRenderObjects(renderObjects: UniqueSet<RenderObject, 'id'>){
        this.renderObjects.addAll(renderObjects)
    }

    public addRenderObject(renderObject: RenderObject){
        this.renderObjects.add(renderObject);
    }

    public getObj(){
        return this.renderObjects;
    }

    public removeRenderObject(renderObject: RenderObject){
        this.renderObjects.delete(renderObject.id);
    }

    public clearRenderObjects(){
        for (const [_, renderObj] of this.renderObjects.entries()) {
            console.log("RenderObj id", renderObj.id)
            // if(Object.values(SCREENS).includes(renderObj.id)){
            if(SCREENS.)){
                continue
            }
            this.renderObjects.delete(renderObj.id);
        }
    }

    public render(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        for(const [_, renderObject] of this.renderObjects.entries()){
            if(renderObject.isActive){
                renderObject.render(this.ctx)
            }
        }
    }
}