import {UniqueSet} from "./helpers/UniqueSet.js";
import {ControlGroup} from "./node/ControlGroup.js";
import {Controller} from "./controllers/Controller.js";
import {MainMenu} from "../ui/MainMenu.js";
import {BasicNode} from "../prefabs/node.js";
import {AIControllerV1} from "./controllers/AIControllerV1.js";
import {PlayerController} from "./controllers/PlayerController.js";
import {GROUP_TYPES, LEVELS, MENU_TABS} from "./config/constants.js";
import {fetchLevel, pareJsonLevel, parseJsonLevel} from "../configs/dataLoader.js";
import {ILevel} from "../configs/filesStructures.js";
import {RenderEngine} from "./render/RenderEngine.js";
import {GameObject} from "./render/RenderObject.js";

export class GameEngine{
    private canvas: HTMLCanvasElement;
    private frameId: number = 0;
    private lastTime: DOMHighResTimeStamp = 0;
    private controllers: Map<string, Controller>
    private mainMenu: MainMenu
    private renderEngine: RenderEngine
    private gameObjects: UniqueSet<GameObject, "id">
    private static instance: GameEngine | null = null

    private isFinished = false

    private constructor(canvasId: string) {
        const el = document.getElementById(canvasId);
        if (!(el instanceof HTMLCanvasElement)) {
            throw new Error(`Element #${canvasId} is not a valid Canvas.`);
        }

        this.canvas = el;
        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get Canvas 2D context.");
        }
        this.controllers = new Map()
        GameEngine.instance = this
        this.mainMenu = new MainMenu(this.canvas)
        this.renderEngine = RenderEngine.init(this.canvas)
        this.gameObjects = new UniqueSet("id")

        // this.mainMenu.load()
    }

    public static init(canvasId: string){
        console.log("Initializing GameEngine")
        if(GameEngine.instance){
            throw new Error("GameEngine already initialized")
        }
        new GameEngine(canvasId)
        return GameEngine.instance
    }

    public static getInstance(){
        if(!GameEngine.instance){
            throw new Error("[GameEngine] must be initialized with init before calling getInstance")
        }
        return GameEngine.instance
    }

    public addGameObject(gameObj: GameObject){
        this.gameObjects.add(gameObj)
    }

    public start(): void {
        if (this.frameId === 0) {
            this.lastTime = 0; // Reset timeline tracking
            this.frameId = requestAnimationFrame(this.loop);
        }
    }

    public stop(): void {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = 0;
        }
    }

    private loop = (timestamp: DOMHighResTimeStamp): void => {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.renderEngine.render()

        if(!this.isFinished){
            this.frameId = requestAnimationFrame(this.loop);
        } else {
            this.stop()
            this.gameObjects.clear()
            this.renderEngine.clearRenderObjects()
            this.controllers.clear()
            this.mainMenu.activateTab(MENU_TABS.BASE)
        }
    };

    private update(dt: number){
        this.isFinished = this.checkForGameEnd()

        for(const [_, gameObj] of this.gameObjects.entries()){
            gameObj.update(dt)
        }
    }

    private initCanvas(){
        //Creates canvas when container is provided
        // this.canvas = document.createElement('canvas')
        //
        // this.canvas.style.border = "1px solid black"
        //
        // this.canvas.width = 1920
        // this.canvas.height = 1080
        //
        // this.container.appendChild(this.canvas)
        //
        // const ctx = this.canvas.getContext("2d")
        // if(ctx){
        //     this.context = ctx
        // }else {
        //     console.error("Could not get context")
        // }
    }

    private checkForGameEnd(){
        let groupCount = 0
        for(const [_, gameObj] of this.gameObjects.entries()){
            if(gameObj instanceof ControlGroup){
                groupCount++
                if(gameObj.isDefeated()){
                    const controller = this.controllers.get(gameObj.id)
                    controller?.stop()
                    groupCount --
                    this.gameObjects.delete(gameObj.id)
                }
            }
        }

        return  groupCount <= 1
    }

    public loadTestLevel(){
        //todo
        throw new Error("Level not implemented")
    }

    public loadLevel(levelName: typeof LEVELS[keyof typeof LEVELS]){
        fetchLevel(levelName).then(r=> {
            const levelData = pareJsonLevel(r as ILevel)

            this.renderEngine.setRenderObjects(levelData.renderObjects)
            this.gameObjects.clear()
            for(const [_, gameObj] of levelData.gameObjects.entries()){
                this.gameObjects.add(gameObj)
            }

            this.controllers = new Map()

            for (const [_, group] of levelData.groups.entries()){
                if(group.id == GROUP_TYPES.PLAYER){
                    this.controllers.set(group.id, new PlayerController(this.canvas, group))
                }else if(group.id.includes("AI")){
                    this.controllers.set(group.id, new AIControllerV1(group))
                }
            }
            this.start()
        })

    }
}