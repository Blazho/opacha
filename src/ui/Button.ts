import {Position} from "../scripts/helpers/IHelper";

export class Button{
    private text: string
    private width: number
    private height: number
    private func: () => void
    private position: Position


    constructor(text: string, width: number, height: number, func: () => void, position: Position) {
        this.text = text;
        this.width = width;
        this.height = height;
        this.func = func;
        this.position = position
    }

    public invokeFun(){
        this.func()
    }

    public draw(ctx: CanvasRenderingContext2D){
        ctx.beginPath()
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
        ctx.fillStyle = "gray"
    }
}