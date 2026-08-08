import {UniqueSet} from "../helpers/UniqueSet.js";
import {UIScreen} from "./UIScreen.js";
import {MainMenu} from "../../ui/MainMenu.js";
import {GameEngine} from "../GameEngine.js";
import {LEVELS, SCREENS} from "../config/constants.js";


export class UIEngine{
    private static instance: UIEngine | null = null
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D

    private screens: UniqueSet<UIScreen, "id">

    private constructor(canvas: HTMLCanvasElement)  {
        this.canvas = canvas
        const context = canvas.getContext("2d")
        if(!context){
            throw new Error("[RenderEngine] Can not get context from canvas element")
        }
        this.ctx = context

        this.screens = new UniqueSet("id")

        this.initScreens()
    }

    public static init(canvas: HTMLCanvasElement){
        console.log("Initializing UI Engine")
        if(UIEngine.instance){
            throw new Error("RenderEngine already initialized")
        }
        UIEngine.instance = new UIEngine(canvas)

        return UIEngine.instance
    }

    public static getInstance(){
        if(!UIEngine.instance){
            throw new Error("[UIEngine] must be initialized with init before calling getInstance")
        }
        return UIEngine.instance
    }

    public activate(screen: typeof SCREENS[keyof typeof SCREENS]){
        for(const [_, screen] of this.screens.entries()){
            screen.isActive = false
        }

        const activeScreen = this.screens.get(screen)
        if(activeScreen){
            activeScreen.isActive = true
            console.log("Rendering: ", activeScreen)
            activeScreen.render(this.ctx)
        }
    }

    private initScreens(){
        const mainMenu = new MainMenu(this.canvas)
        mainMenu.generateTabs()
        this.screens.add(mainMenu)

    }
}