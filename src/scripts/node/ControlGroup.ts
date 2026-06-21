import {UniqueSet} from "../helpers/UniqueSet.js";
import {BasicNode} from "../../prefabs/node.js";
import {Position} from "../helpers/IHelper";
import {Path} from "../../prefabs/Path.js";

export class ControlGroup {
    public readonly name: string
    //controllable nodes
    private groupNodes: UniqueSet<BasicNode, "id">
    //non-controllable nodes
    private otherNodes: UniqueSet<BasicNode, "id">
    public readonly color: string;

    constructor(name: string, color: string) {
        this.name = name
        this.color = color
        this.groupNodes = new UniqueSet<BasicNode, "id">("id")
        this.otherNodes = new UniqueSet<BasicNode, "id">("id")
    }

    //Use it only for adding fresh new node
    public addNode(node: BasicNode): ControlGroup {
        if (node.getGroup()){
            console.log("Node already has group")
            return this
        }
        node.setGroup(this)
        this.groupNodes.add(node)
        return this
    }

    public findNode(position: Position, checkOtherNodes = false): BasicNode | null{
        for(const [_, node] of this.groupNodes.entries()){
            if(node.isInsideNode(position)){
                console.log("Selected node ", node)
                return node
            }
        }
        if(checkOtherNodes){
            for (const [_, node] of this.otherNodes.entries()){
                if(node.isInsideNode(position)){
                    console.log("Other node found!! ", node)
                    return node
                }
            }
        }
        return null
    }


    public addConnection(node1: BasicNode, node2: BasicNode): ControlGroup{
        if(!this.groupNodes.has(node1.id) || !this.groupNodes.has(node2.id)){
            console.log(`Node ${node1.id} and ${node2.id} not found in control group ${this.name}.`)
            return this
        }

        const path = new Path(node1, node2)
        node1.addPath(path)
        node2.addPath(path)
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
        const path = new Path(contNode, nonContNode)
        contNode.addPath(path)
        nonContNode.addPath(path)
        return this
    }

    public update(){
        if(this.groupNodes.length() === 0){
            return
        }
        for(const [_, value] of this.groupNodes.entries()){
            value.update()
        }
    }

    public printState(){
        console.log(`${this.name} nodes: `, this.groupNodes)
    }

    //todo draws duplicates
    public drawAllNonDuplicatesConnections(ctx: CanvasRenderingContext2D){
        // const connections : [BasicNode, BasicNode][] = []
        for(const [_, node] of this.groupNodes.entries()){
            for (const [_, connected] of node.connectedTo.entries()){
                // if(node.id < connected.id){
                //     connections.push([node, connected])
                // }
                this.drawConnections(ctx, connected.node1, connected.node2)
            }
        }

        // for(const pair of connections){
        //     this.drawConnections(ctx, pair[0], pair[1])
        // }
    }

    //todo draws duplicates
    public drawNodesPathsAndArmies(ctx: CanvasRenderingContext2D){
        for(const [_, node] of this.groupNodes.entries()){
            node.drawPathAndArmies(ctx)
        }
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

    takeNode(node: BasicNode) {
        const nodesGroup = node.getGroup()
        nodesGroup?.groupNodes.delete(node.id)
        nodesGroup?.checkOptionalNodes()

        node.setGroup(this)
        this.groupNodes.add(node)
        this.checkOptionalNodes()
    }

    //todo not optimised
    //fixes optional nodes
    private checkOptionalNodes(){
        this.otherNodes.clear()
        for (const [_, value] of this.groupNodes.entries()){
            for (const [_, path] of value.connectedTo.entries()){
                if(!this.groupNodes.has(path.node1.id)){
                    this.otherNodes.add(path.node1)
                }
                if(!this.groupNodes.has(path.node2.id)){
                    this.otherNodes.add(path.node2)
                }
            }
        }
    }

    private drawConnections(ctx: CanvasRenderingContext2D, n1: BasicNode, n2: BasicNode){
        ctx.beginPath();
        ctx.moveTo(n1.getPosition().x, n1.getPosition().y); // Start point
        ctx.lineTo(n2.getPosition().x, n2.getPosition().y); // End point
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}