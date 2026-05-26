import {UniqueSet} from "../helpers/UniqueSet.js";
import {BasicNode} from "../../prefabs/node.js";
import {Position} from "../helpers/IHelper";

export class ControlGroup {
    public readonly name: string
    //controllable nodes
    private groupNodes: UniqueSet<BasicNode, "id">
    //non-controllable nodes
    private otherNodes: UniqueSet<BasicNode, "id">
    private readonly color: string;

    constructor(name: string, color: string) {
        this.name = name
        this.color = color
        this.groupNodes = new UniqueSet<BasicNode, "id">("id")
        this.otherNodes = new UniqueSet<BasicNode, "id">("id")
    }

    //Use it only for adding fresh new node
    public addNode(node: BasicNode): ControlGroup {
        // if (node.getGroup()){
        //     console.log("Node already has group")
        //     return this
        // }
        node.setGroup(this)
        this.groupNodes.add(node)
        return this
    }

    public findNode(position: Position): BasicNode | null{
        for(const [_, node] of this.groupNodes.entries()){
            if(node.isInsideNode(position)){
                console.log("Selected node ", node)
                return node
            }
        }

        for (const [_, node] of this.otherNodes.entries()){
            if(node.isInsideNode(position)){
                console.log("Other node found!! ", node)
                return node
            }
        }
        return null
    }

    public takeNode(node: BasicNode): BasicNode {
        this.groupNodes.add(node)
        this.otherNodes.delete(node.id)
        return node
    }

    public giveNodeTo(node: BasicNode, newGroup: ControlGroup) {
        // console.log("Node :", node, ", newGroup:", newGroup)
        this.otherNodes.add(node)
        this.groupNodes.delete(node.id)

        newGroup.takeNode(node)
        node.setGroup(newGroup)
        console.log(newGroup)
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

    public addOtherConnection(contNode: BasicNode, nonContNode: BasicNode): ControlGroup{
        if(!this.groupNodes.has(contNode.id)){
            console.log(`Node ${contNode.id} not found in control group ${this.name}.`)
            return this
        }

        if (nonContNode === null) {
            console.log(`Other node is null`)
            return this
        }

        this.otherNodes.add(nonContNode)
        contNode.addConnection(nonContNode)
        nonContNode.addConnection(contNode)
        console.log(this)
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
            node.drawNode(ctx, this.color, node.isSelected)
            node.drawTransfer(ctx, this.color)
        }
    }

    isAttackTarget(node: BasicNode): boolean {
        return this.otherNodes.has(node.id)
    }
}