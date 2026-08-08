import {UIScreenObject} from "../scripts/render/RenderObject.js";
import {SCREENS} from "../scripts/config/constants.js";
import {MenuTab} from "./MenuTab.js";
//todo implement
export class GameUIScreen extends UIScreenObject{

    // private tab: MenuTab

    constructor() {
        super(SCREENS.GAME_UI_SCREEN);

        this.genTab()
    }

    load(): void {
    }

    render(context: CanvasRenderingContext2D): void {
    }

    update(dt: number): void {
    }

    private genTab(){

    }

}