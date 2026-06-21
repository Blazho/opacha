import {ControlGroup} from "../node/ControlGroup";
import {BasicNode} from "../../prefabs/node";

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


    private playerGroup: ControlGroup
    private readonly canvas: HTMLCanvasElement
    private clickTimer: number
    private selectedNode: BasicNode | null;


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
                const checkOther = this.selectedNode != null
                const node = this.playerGroup.findNode(pos, checkOther)
                this.processNode(node)
            }, 250)
        })
    }

    private processNode(node: BasicNode | null){
            if(this.selectedNode){
                if(node){
                    const isAttackTarget = this.playerGroup.isAttackTarget(node)
                    this.selectedNode.setTargetNode(node, isAttackTarget)
                }
                this.selectedNode.isSelected = false
                this.selectedNode = null
            }else {
                if(node){
                    this.selectedNode = node
                    this.selectedNode.isSelected = true
                }
            }
    }

    private setDBClickListener(){
        this.canvas.addEventListener('dblclick', (e) =>{
            clearTimeout(this.clickTimer)
            const pos = this.getMousePosition(e)
            this.playerGroup.findNode(pos)?.clearTarget()
        })
    }

}