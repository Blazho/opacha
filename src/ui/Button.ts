import {Position} from "../scripts/helpers/IHelper";

export class Button{
    private text: string
    private _width: number
    private _height: number
    private func: () => void
    private _position: Position


    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get position(): Position {
        return this._position;
    }

    constructor(text: string, width: number, height: number, func: () => void, position: Position) {
        this.text = text;
        this._width = width;
        this._height = height;
        this.func = func;
        this._position = position
    }

    public invokeFun(){
        this.func()
    }

    public draw(ctx: CanvasRenderingContext2D){
        ctx.beginPath()
        ctx.fillStyle = "gray"
        ctx.fillRect(this._position.x, this._position.y, this._width, this._height)

        ctx.lineWidth = 5
        ctx.strokeStyle = "#000"
        ctx.strokeRect(this._position.x, this._position.y, this._width, this._height)

        ctx.font = '20px Verdana';
        ctx.fillStyle = "white";
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const xOff = this._position.x + (this._width / 2)
        const yOff = this._position.y + (this._height / 2)
        ctx.fillText(this.text, xOff, yOff)

    }
}