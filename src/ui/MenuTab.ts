import {Button} from "./Button";
import {MainMenu} from "./MainMenu";
import {Position} from "../scripts/helpers/IHelper";

export class MenuTab{
    readonly name;
    private buttons: Button[];
    private canvas : HTMLCanvasElement;
    public isActive: boolean

    constructor(name: string, canvas: HTMLCanvasElement) {
        this.name = name
        this.canvas = canvas
        this.isActive = false
        this.buttons = []
    }

    public addButtons(listOfButtons: Button[]){
        this.buttons = listOfButtons
    }

    public activate(){
        this.isActive = true
    }

    public draw(){
        const ctx = this.canvas.getContext("2d");
        if(ctx){
            for(const btn of this.buttons){
                btn.draw(ctx)
            }
        }else {
            console.error("Could not get context for canvas")
        }
    }

    public processClick(clickPos: Position){
        for(const btn of this.buttons){
            if(this.clickedOn(btn, clickPos)){
                btn.invokeFun()
                break
            }
        }
    }

    private clickedOn(btn: Button, clickPos: Position) {
        return btn.position.x < clickPos.x && btn.position.y < clickPos.y &&
            btn.position.x + btn.width > clickPos.x && btn.position.y + btn.height > clickPos.y;

    }
}