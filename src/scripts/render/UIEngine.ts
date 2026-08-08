import {UniqueSet} from "../helpers/UniqueSet.js";
import {MainMenu} from "../../ui/MainMenu.js";
import {GameEngine} from "../GameEngine.js";
import {LEVELS, SCREENS} from "../config/constants.js";
import {GameObject, RenderObject, UIScreenObject} from "./RenderObject.js";
import {RenderEngine} from "./RenderEngine.js";
import {GameUIScreen} from "../../ui/GameUIScreen.js";


export class UIEngine{
    private static instance: UIEngine | null = null
    private canvas: HTMLCanvasElement

    private screens: UniqueSet<UIScreenObject, "id">

    private constructor(canvas: HTMLCanvasElement)  {
        this.canvas = canvas
        this.screens = new UniqueSet("id")

        this.initScreens()
    }

    public static init(canvas: HTMLCanvasElement){
        console.log("Initializing UI Engine")
        if(UIEngine.instance){
            throw new Error("UIEngine already initialized")
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
        console.log("To be activated screen", screen)
        for(const [_, screen] of this.screens.entries()){
            screen.isActive = false
        }

        const activeScreen = this.screens.get(screen)
        if(activeScreen){
            console.log("Activated screen", activeScreen)
            activeScreen.isActive = true
            activeScreen.load()
        }
    }

    public getActiveScreen(){
        for(let [_, screen] of this.screens.entries()){
            if(screen.isActive){
                return screen.id
            }
        }

        throw Error("Unable to get active screen")
    }

    private initScreens(){
        const renderEngine = RenderEngine.getInstance()

        const mainMenu = new MainMenu(this.canvas)
        mainMenu.isActive = false
        renderEngine.addRenderObject(mainMenu)
        this.screens.add(mainMenu)

        const tmp = new GameUIScreen()
        tmp.isActive = false
        renderEngine.addRenderObject(tmp)
        this.screens.add(tmp)
    }
}