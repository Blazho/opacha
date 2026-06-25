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
        ctx.fillStyle = "gray"
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

        ctx.lineWidth = 5
        ctx.strokeStyle = "#000"
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height)

        ctx.font = '20px Verdana';
        ctx.fillStyle = "white";
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const xOff = this.position.x + (this.width / 2)
        const yOff = this.position.y + (this.height / 2)
        ctx.fillText(this.text, xOff, yOff)

    }
}