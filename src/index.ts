import {BasicNode} from "./prefabs/node.js";
import {ControlGroup} from "./scripts/node/ControlGroup.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement
if(canvas){

    const n1 = new BasicNode('n1')
    const n2 = new BasicNode('n2', 1000, 50 , 50, 0, 5)
    const n3 = new BasicNode('n3', 300, 100 , 50, 0,30)

    const group1 = new ControlGroup("Team1")

    group1
        .addNode(n1)
        .addNode(n2)
        .addNode(n3)
        .addConnection(n1, n2)
        .addConnection(n2, n3)

    group1.printState()
    const ctx = canvas.getContext('2d')
    if(ctx){
        setInterval(() => {
            //clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            group1.update()
            group1.drawAllNonDuplicatesConnections(ctx)
            group1.drawNodes(ctx)
        }, 200)
    }

    let clickTimer: number

    canvas.addEventListener('click', (e) =>{
        clearTimeout(clickTimer)
        clickTimer = setTimeout(()=>{
            const pos = getMousePosition(canvas, e)
            group1.selectNode(pos)
        }, 250)

    })

    canvas.addEventListener('dblclick', (e) =>{
        clearTimeout(clickTimer)
        const pos = getMousePosition(canvas, e)
        group1.setToIdle(pos)
    })


    function getMousePosition(canvas: HTMLCanvasElement, e: PointerEvent | MouseEvent) {
        const rect = canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }
}


