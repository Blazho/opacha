import {ControlGroup} from "../node/ControlGroup";
import {BasicNode} from "../../prefabs/node";
import {getMousePosition} from "../helpers/FHelper.js";
import {Controller} from "./Controller";

/**
 * Class responsible for player inputs
 *
 */
export class PlayerController implements Controller{
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

    getGroupName(): string {
        return this.playerGroup.name
    }

    process(): void {

    }
    stop(): void {
        this.clearCanvasEvents()
    }

    public clearCanvasEvents(){
        this.clearClickEventListener()
        this.clearDBClickListener()
    }

    private setClickEventListener(){
        this.canvas.addEventListener('click', this.clickHandler);
    }

    private clearClickEventListener(){
        this.canvas.removeEventListener('click', this.clickHandler);
    }

    private clickHandler = (e: PointerEvent) => {
        clearTimeout(this.clickTimer)
        //So it can be canceled if double-clicked
        this.clickTimer = setTimeout(()=>{
            const pos = getMousePosition(e, this.canvas)
            const checkOther = this.selectedNode != null
            const node = this.playerGroup.findNode(pos, checkOther)
            this.processNode(node)
        }, 250)
    }

    private processNode(node: BasicNode | null){
            if(this.selectedNode){
                if(node){
                    this.selectedNode.setTargetNode(node)
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
        this.canvas.addEventListener('dblclick', this.dblClickHandler)
    }

    private clearDBClickListener(){
        this.canvas.removeEventListener('dblclick', this.dblClickHandler)
    }

    private dblClickHandler = (e: MouseEvent) => {
        clearTimeout(this.clickTimer)
        const pos = getMousePosition(e, this.canvas)
        this.playerGroup.findNode(pos)?.clearTarget()
    }

}