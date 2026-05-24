import {ControlGroup} from "./node/ControlGroup";
import {BasicNode} from "../prefabs/node";
import {Event} from "./helpers/CHelper.js";

/**
 * Class responsible for player inputs
 *
 */
export class PlayerController{
    /**
     * click
     *
     * - [own node] Select the node
     * - [enemy node (not selected own)] Ignore
     * - [enemy node (selected own)] Set to attack
     *
     * db click
     * - [own node] Set node to idle
     * - [enemy node] Single attack by all adjacent own nodes
     * **/

    //todo maybe controller should be in control group

    private playerGroup: ControlGroup
    private readonly canvas: HTMLCanvasElement
    private clickTimer: number
    private selectedNode: BasicNode | null;

    onSelectionChanged: Event<BasicNode | null> = new Event()

    constructor(canvas: HTMLCanvasElement, group: ControlGroup) {
        this.canvas = canvas;
        this.playerGroup = group
        this.clickTimer = 0
        this.selectedNode = null

        this.setClickEventListener()
        this.setDBClickListener()
    }

    private getMousePosition(e: PointerEvent | MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    private setClickEventListener(){
        this.canvas.addEventListener('click', (e) =>{
            clearTimeout(this.clickTimer)
            //So it can be canceled if double-clicked
            this.clickTimer = setTimeout(()=>{
                const pos = this.getMousePosition(e)
                const node = this.playerGroup.findNode(pos)
                this.processNode(node)
            }, 150)
        })
    }

    private processNode(node: BasicNode | null){
            if(this.selectedNode){
                if(node){
                    this.selectedNode.setTargetNode(node)
                }
                this.selectedNode = null
            }else {
                if(node){
                    this.selectedNode = node
                    this.onSelectionChanged.emit(node)
                }
            }
    }

    private setDBClickListener(){
        this.canvas.addEventListener('dblclick', (e) =>{
            clearTimeout(this.clickTimer)
            const pos = this.getMousePosition(e)
            this.playerGroup.setToIdle(pos)
        })
    }

}