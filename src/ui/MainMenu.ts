import {Button} from "./Button.js";
import {Position} from "../scripts/helpers/IHelper.js";
import {Game} from "../prefabs/Game.js";

export class MainMenu{
    private buttons:Button[];
    private canvas : HTMLCanvasElement;
    private readonly game: Game

    constructor(canvas: HTMLCanvasElement, game: Game) {
        this.buttons = []
        this.canvas  = canvas;
        this.game = game
    }

    public load(){
        console.log("Loading...");
        this.addClickEventListener()
        this.buttons.push(new Button(
            "Load test game",
            100, 50,
            () => {
                this.game.loadTestLevel()
                this.game.render()
            },
            { x: this.canvas.width / 2, y: 100 }
            ))

        this.buttons.push(new Button(
            "Test button 2",
            100, 50,
            () => { console.log("Test button clicked 2"); },
            { x: this.canvas.width / 2, y: 150 }
        ))

        this.draw()
    }

    private draw(){
        const ctx = this.canvas.getContext("2d");
        if(ctx){
            for(const btn of this.buttons){
                btn.draw(ctx)
            }
        }
    }

    private addClickEventListener(){
        this.canvas.addEventListener("click", this.handleClick)
    }

    private clearClickEventListener(){
        this.canvas.removeEventListener("click", this.handleClick)
    }

    private handleClick = (e: PointerEvent) => {
        const clickPos = this.getMousePosition(e)

        for(const btn of this.buttons){
            if(this.clickedOn(btn, clickPos)){
                btn.invokeFun()
            }
        }
    }

    //todo duplicate
    private getMousePosition(e: PointerEvent | MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    private clickedOn(btn: Button, clickPos: Position) {
        return btn.position.x < clickPos.x && btn.position.y < clickPos.y &&
            btn.position.x + btn.width > clickPos.x && btn.position.y + btn.height > clickPos.y;

    }
}