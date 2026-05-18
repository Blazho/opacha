import {UniqueSet} from "../helpers/UniqueSet.js";
import {BasicNode} from "../../prefabs/node.js";
import {Position} from "../helpers/IHelper";

export class ControlGroup {
    private name: string
    private groupNodes: UniqueSet<BasicNode, "id">
    private selectedNode: BasicNode | null;

    constructor(name: string) {
        this.name = name
        this.groupNodes = new UniqueSet<BasicNode, "id">("id")
        this.selectedNode = null
    }

    public addNode(node: BasicNode): ControlGroup {
        this.groupNodes.add(node)
        return this
    }

    public selectNode(clickPosition: Position){
        if(this.selectedNode){
            const targetNode = this.findNode(clickPosition)
            if(targetNode){
                this.selectedNode.setTargetNode(targetNode)
            }
            this.selectedNode = null
            console.log("selectedNode cleared")
        }else {
            const targetNode = this.findNode(clickPosition)
            if(targetNode){
                this.selectedNode = targetNode
                console.log("selectedNode", targetNode)
            }
        }
    }

    setToIdle(pos: { x: number; y: number; }) {
        const node = this.findNode(pos)
        if(node){
            node.setState("IdleState")
        }
    }

    private findNode(position: Position): BasicNode | null{
        for(const [_, node] of this.groupNodes.entries()){
            if(node.isInsideNode(position)){
                return node
            }
        }
        return null
    }

    public clearSelectedNode(){
        this.selectedNode = null
    }

    public removeNode(node: BasicNode): BasicNode {
        this.groupNodes.delete(node.id)
        return node
    }

    public addConnection(node1: BasicNode, node2: BasicNode): ControlGroup{
        if(!this.groupNodes.has(node1.id) || !this.groupNodes.has(node2.id)){
            console.log(`Node ${node1.id} and ${node2.id} not found in control group ${this.name}.`)
            return this
        }
        node1.addConnection(node2)
        node2.addConnection(node1)
        return this
    }

    public update(){
        for(const [_, value] of this.groupNodes.entries()){
            value.update()
        }
    }

    public printState(){
        console.log(`${this.name} nodes: `, this.groupNodes)
    }

    public drawAllNonDuplicatesConnections(ctx: CanvasRenderingContext2D){
        const connections : [BasicNode, BasicNode][] = []
        for(const [_, node] of this.groupNodes.entries()){
            for (const [_, connected] of node.connectedTo.entries()){
                if(node.id < connected.id){
                    connections.push([node, connected])
                }
            }
        }

        for(const pair of connections){
            this.drawConnections(ctx, pair[0], pair[1])
        }



    }

    private drawConnections(ctx: CanvasRenderingContext2D, n1: BasicNode, n2: BasicNode){

        ctx.beginPath();
        ctx.moveTo(n1.getX(), n1.getY()); // Start point
        ctx.lineTo(n2.getX(), n2.getY()); // End point
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawNodes(ctx: CanvasRenderingContext2D) {
        for(const [_, node] of this.groupNodes.entries()){
            node.draw(ctx, this.selectedNode?.id === node.id)
        }
    }
}