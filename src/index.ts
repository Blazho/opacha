import {BasicNode} from "./prefabs/node.js";
import {ControlGroup} from "./scripts/node/ControlGroup.js";
import {PlayerController} from "./scripts/PlayerController.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement
if(canvas){

    const pn1 = new BasicNode('pn1')
    const pn2 = new BasicNode('pn2', 1000, 50 , 50, 0, 5)
    const pn3 = new BasicNode('pn3', 300, 100 , 50, 0,30)

    const playerControlGroup = new ControlGroup("Team1", "blue")

    const playerController = new PlayerController(canvas, playerControlGroup)

    const ain1 = new BasicNode('ain1', 500, 500)
    const ain2 = new BasicNode('ain2', 750, 500)
    const ain3 = new BasicNode('ain3', 1000, 600)

    const aiControlGroup = new ControlGroup('Team2', "red")

    aiControlGroup
        .addNode(ain1)
        .addNode(ain2)
        .addNode(ain3)
        .addConnection(ain3, ain1)
        .addConnection(ain3, ain2)
        .addConnection(pn3, ain2)

    playerControlGroup
        .addNode(pn1)
        .addNode(pn2)
        .addNode(pn3)
        .addConnection(pn1, pn2)
        .addConnection(pn2, pn3)
        .addConnection(pn3, ain2)


    //todo refactor
    //draw groups on canvas
    const ctx = canvas.getContext('2d')
    if(ctx){
        setInterval(() => {
            //clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            aiControlGroup.update()
            aiControlGroup.drawAllNonDuplicatesConnections(ctx)
            aiControlGroup.drawNodes(ctx)

            playerControlGroup.update()
            playerControlGroup.drawAllNonDuplicatesConnections(ctx)
            playerControlGroup.drawNodes(ctx)
        }, 1000 / 60)
    }
}


