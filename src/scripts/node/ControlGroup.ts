import {UniqueSet} from "../helpers/UniqueSet.js";
import {BasicNode} from "../../prefabs/node.js";
import {Position} from "../helpers/IHelper.js";
import {Path} from "../../prefabs/Path.js";
import {GameObject} from "../render/RenderObject.js";

export class ControlGroup extends GameObject{
    //controllable nodes
    private _groupNodes: UniqueSet<BasicNode, "id">
    //non-controllable nodes that this group can attack
    private otherNodes: UniqueSet<BasicNode, "id">
    public readonly color: string;

    constructor(id: string, color: string) {
        super(id)
        this.color = color
        this._groupNodes = new UniqueSet<BasicNode, "id">("id")
        this.otherNodes = new UniqueSet<BasicNode, "id">("id")
    }

    //Use it only for adding fresh new node
    public addNode(node: BasicNode): ControlGroup {
        if (node.getGroup()){
            console.log("Node already has group")
            return this
        }
        node.setGroup(this)
        this._groupNodes.add(node)
        return this
    }

    public init(){
        this.checkOptionalNodes()
    }

    public findNode(position: Position, checkOtherNodes = false): BasicNode | null{
        for(const [_, node] of this._groupNodes.entries()){
            if(node.isInsideNode(position)){
                return node
            }
        }
        if(checkOtherNodes){
            for (const [_, node] of this.otherNodes.entries()){
                if(node.isInsideNode(position)){
                    return node
                }
            }
        }
        return null
    }


    get groupNodes(): UniqueSet<BasicNode, "id"> {
        return this._groupNodes;
    }

    public static addConnection(node1: BasicNode, node2: BasicNode){
        const path = new Path(node1, node2)
        node1.addPath(path)
        node2.addPath(path)

        return path
    }

    public update(dt: number){
        if(this._groupNodes.length() === 0){
            return
        }
        for(const [_, nodes] of this._groupNodes.entries()){
            nodes.update(dt)
        }
    }

    public toString(){
        console.log(`${this.id} nodes: `, this._groupNodes)
    }

    //todo draws duplicates
    public drawNodesPathsAndArmies(ctx: CanvasRenderingContext2D){
        for(const [_, node] of this._groupNodes.entries()){
            node.drawPathAndArmies(ctx)
        }
    }

    drawNodes(ctx: CanvasRenderingContext2D) {
        for(const [_, node] of this._groupNodes.entries()){
            node.render(ctx)
        }
    }

    takeNode(node: BasicNode) {
        const nodesGroup = node.getGroup()
        nodesGroup?._groupNodes.delete(node.id)
        nodesGroup?.checkOptionalNodes()

        node.setGroup(this)
        this._groupNodes.add(node)
        this.checkOptionalNodes()
    }

    public isDefeated(): boolean{
        return this._groupNodes.length() == 0
    }

    private checkOptionalNodes(){
        this.otherNodes.clear()
        for (const [_, value] of this._groupNodes.entries()){
            for (const [_, path] of value.connectedTo.entries()){
                if(!this._groupNodes.has(path.node1.id)){
                    this.otherNodes.add(path.node1)
                }
                if(!this._groupNodes.has(path.node2.id)){
                    this.otherNodes.add(path.node2)
                }
            }
        }
    }
}