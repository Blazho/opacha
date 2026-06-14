import {BasicNode} from "./node.js";
import {Army} from "./Army.js";

export class Path{
    public node1: BasicNode
    public node2: BasicNode
    public armies: Army[]

    constructor(node1: BasicNode, node2: BasicNode) {
        this.node1 = node1;
        this.node2 = node2;
        this.armies = []
    }

    addArmy(newArmy: Army){
        //todo refactor to use unique set
        this.armies.push(newArmy)
    }

    removeArmy(army: Army){
        //todo refactor
        this.armies = this.armies.filter(r=> r !== army)
    }

    getOtherNode(node: BasicNode){
        if(!this.isNodeOnPath(node)){
            console.error(`Node ${node.id} is not on this path.`)
            return
        }

        return node === this.node1 ? this.node2 : this.node1
    }

    moveArmies(){
        this.removeDeadArmies()
        this.armies.forEach(r=> r.moveToNextPosition())
    }

    private removeDeadArmies(){
        //todo rework
        for(let i = this.armies.length-1; i>=0; i--){
            if(this.armies[i].count < 0){
                this.removeArmy(this.armies[i])
                // delete this.armies[i]
            }
        }
    }

    private isNodeOnPath(node: BasicNode){
        return node === this.node1 || node === this.node2
    }
}