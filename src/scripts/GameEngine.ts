import {UniqueSet} from "./helpers/UniqueSet.js";
import {ControlGroup} from "./node/ControlGroup.js";
import {Controller} from "./controllers/Controller.js";
import {MainMenu} from "../ui/MainMenu.js";
import {BasicNode} from "../prefabs/node.js";
import {AIControllerV1} from "./controllers/AIControllerV1.js";
import {PlayerController} from "./controllers/PlayerController.js";
import {GROUP_TYPES, LEVELS, MENU_TABS} from "./config/constants.js";
import {fetchLevel, parseJsonLevel} from "../configs/dataLoader.js";
import {ILevel} from "../configs/filesStructures.js";

export class GameEngine{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private frameId: number = 0;
    private lastTime: DOMHighResTimeStamp = 0;
    private groups: UniqueSet<ControlGroup, "id">
    private controllers: Map<string, Controller>
    private mainMenu: MainMenu

    private isFinished = false

    constructor(canvasId: string) {
        const el = document.getElementById(canvasId);
        if (!(el instanceof HTMLCanvasElement)) {
            throw new Error(`Element #${canvasId} is not a valid Canvas.`);
        }

        this.canvas = el;
        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get Canvas 2D context.");
        }
        this.ctx = context;
        this.groups = new UniqueSet("id")
        this.controllers = new Map()
        this.mainMenu = new MainMenu(this.canvas, this)

        this.mainMenu.load()
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
        this.render();

        if(!this.isFinished){
            this.frameId = requestAnimationFrame(this.loop);
        } else {
            this.stop()
            this.groups.clear()
            this.controllers.clear()
            this.mainMenu.activateTab(MENU_TABS.BASE)
        }
    };

    private update(dt: number){
        this.isFinished = this.checkForGameEnd()

        for(const [_, group] of this.groups.entries()){
            group.update(dt)
        }
    }

    private render(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        for(const [_, group] of this.groups.entries()){
            group.drawNodesPathsAndArmies(this.ctx)
        }

        for(const [_, group] of this.groups.entries()){
            group.drawNodes(this.ctx)
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
        for(const [_, group] of this.groups.entries()) {
            if (group.isDefeated()){
                const controller = this.controllers.get(group.id)
                controller?.stop()
                this.groups.delete(group.id)
            }
        }

        if(this.groups.length() <= 1){
            // this.stop()
            // // alert(`Player ${this.groups.toList()[0].name} won`)
            // console.log(`Player ${this.groups.toList()[0].name} won`)
            // this.mainMenu.activateTab(MENU_TABS.BASE)
            return true
        }
        return  false
    }

    public loadTestLevel(){
        const pn1 = new BasicNode("pn1", 100, 100, 1, 20)

        const nn1 = new BasicNode("nn1", 300, 100, 0, 10)
        const nn2 = new BasicNode("nn2", 100, 250, 0, 10)
        const nn3 = new BasicNode("nn3", 300, 250, 0, 10)
        const nn4 = new BasicNode("nn4", 500, 400, 0, 10)

        const nn5 = new BasicNode("nn5", 600, 500, 0, 10)

        const nn6 = new BasicNode("nn6", 700, 600, 0, 10)
        const nn7 = new BasicNode("nn7", 900, 750, 0, 10)
        const nn8 = new BasicNode("nn8", 1100, 750, 0, 10)
        const nn9 = new BasicNode("nn9", 900, 900, 0, 10)

        const ain1 = new BasicNode("ain1", 1100, 900, 1, 20)
        //init control groups
        const neutralControlGroup = new ControlGroup("Neutral", "#6E6E6EFF")
        const playerControlGroup = new ControlGroup("Player", "#0000ff")
        const aiControlGroup = new ControlGroup("AIGroup", "#FFA500")

        //add nodes to groups
        playerControlGroup
            .addNode(pn1)

        neutralControlGroup
            .addNode(nn1)
            .addNode(nn2)
            .addNode(nn3)
            .addNode(nn4)
            .addNode(nn5)
            .addNode(nn6)
            .addNode(nn7)
            .addNode(nn8)
            .addNode(nn9)


        aiControlGroup
            .addNode(ain1)

        //paths
        ControlGroup.addConnection(pn1, nn1)
        ControlGroup.addConnection(pn1, nn2)

        ControlGroup.addConnection(nn1, nn3)
        ControlGroup.addConnection(nn2, nn3)
        ControlGroup.addConnection(nn3, nn4)
        ControlGroup.addConnection(nn4, nn5)
        ControlGroup.addConnection(nn5, nn6)
        ControlGroup.addConnection(nn6, nn7)
        ControlGroup.addConnection(nn7, nn8)
        ControlGroup.addConnection(nn7, nn9)

        ControlGroup.addConnection(ain1, nn8)
        ControlGroup.addConnection(ain1, nn9)

        playerControlGroup.init()
        aiControlGroup.init()

        this.groups.add(playerControlGroup)
        this.groups.add(aiControlGroup)
        this.groups.add(neutralControlGroup)

        this.controllers.set(aiControlGroup.id, new AIControllerV1(aiControlGroup, 2000))
        this.controllers.set(playerControlGroup.id, new PlayerController(this.canvas, playerControlGroup))
    }

    public loadLevel(levelName: typeof LEVELS[keyof typeof LEVELS]){
        fetchLevel(levelName).then(r=> {
            this.groups = parseJsonLevel(r as ILevel)
            this.controllers = new Map()

            for (const [_, group] of this.groups.entries()){
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