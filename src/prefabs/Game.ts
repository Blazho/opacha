import {BasicNode} from "./node.js";
import {ControlGroup} from "../scripts/node/ControlGroup.js";
import {PlayerController} from "../scripts/controllers/PlayerController.js";
import {AIController} from "../scripts/controllers/AIController.js";
import {MainMenu} from "../ui/MainMenu.js";
import {LEVELS} from "../scripts/config/constants.js";
import {loadLevel, parseJsonLevel} from "../configs/dataLoader.js";
import {ILevel} from "../configs/filesStructures.js";

export class Game{
    private static instance: Game
    private static container: HTMLElement
    private static context: CanvasRenderingContext2D
    private static canvas: HTMLCanvasElement
    private static groups: ControlGroup[]
    private static interval: number
    private static controllers: any[]
    private static mainMenu: MainMenu

    private constructor() {
    }

    /**
     * param : container - HTMLElement that will be container for the game
     * Returns instance of the game class
     * **/
    public static getInstance(container: HTMLElement | null = null): Game {
        if(!Game.instance){
            Game.instance = new Game()
            Game.groups = []
            Game.controllers = []
        }

        if (container){
            this.container = container
        }

        if(!this.container){
            this.container = document.body
        }

        return Game.instance
    }

    public static getContext(): CanvasRenderingContext2D{
        return Game.context
    }

    public init(){
        console.log("Game initiating")
        this.initCanvas()
        // this.initMenu()
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
        playerControlGroup
            .addOtherConnection(pn1, nn1)
            .addOtherConnection(pn1, nn2)

        neutralControlGroup
            .addConnection(nn1, nn3)
            .addConnection(nn2, nn3)
            .addConnection(nn3, nn4)
            .addConnection(nn4, nn5)
            .addConnection(nn5, nn6)
            .addConnection(nn6, nn7)
            .addConnection(nn7, nn8)
            .addConnection(nn7, nn9)
            .addOtherConnection(nn1, pn1)
            .addOtherConnection(nn2, pn1)
            .addOtherConnection(nn8, ain1)
            .addOtherConnection(nn9, ain1)

        aiControlGroup
            .addOtherConnection(ain1, nn8)
            .addOtherConnection(ain1, nn9)

        Game.groups = [
            playerControlGroup,
            aiControlGroup,
            neutralControlGroup
        ]

        // Game.controllers.push(new AIController(aiControlGroup, 5000))
        // Game.controllers.push(new AIController(playerControlGroup, 5000))
        Game.controllers.push(new PlayerController(Game.canvas, playerControlGroup))
    }

    public loadLevel(levelName: typeof LEVELS[keyof typeof LEVELS]){
        loadLevel(levelName).then(r=> {
            const groups =  parseJsonLevel(r as ILevel)
            Game.groups = groups.toList()
            Game.controllers = []

            for (const group of Game.groups){
                //todo constant
                if(group.name == "PlayerGroup"){
                    Game.controllers.push(new PlayerController(Game.canvas, group))
                }else if(group.name.includes("AI")){
                    Game.controllers.push(new AIController(group))
                }
            }
        })

}

    public render(){
        if(!Game.context){
            console.error("Canvas context is " + Game.context)
            return
        }

        Game.interval = setInterval(() => {
            //clear canvas
            Game.context.clearRect(0, 0, Game.canvas.width, Game.canvas.height)

            for(const group of Game.groups){
                group.update()
            }

            for(const group of Game.groups){
                group.drawNodesPathsAndArmies(Game.context)
            }

            for(const group of Game.groups){
                group.drawNodes(Game.context)
            }
        }, 1000 / 60)
    }

    public stopGame() {
        clearInterval(Game.interval)
    }

    private initCanvas(){
        Game.canvas = document.createElement('canvas')

        Game.canvas.style.border = "1px solid black"

        Game.canvas.width = 1920
        Game.canvas.height = 1080

        Game.container.appendChild(Game.canvas)

        const ctx = Game.canvas.getContext("2d")
        if(ctx){
            Game.context = ctx
        }else {
            console.error("Could not get context")
        }
    }

    private initMenu(){
        console.log("Loading menu")
        Game.mainMenu = new MainMenu(Game.canvas, Game.instance)
        Game.mainMenu.load()
    }
}