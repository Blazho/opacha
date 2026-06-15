import {BasicNode} from "./node.js";
import {Army} from "./Army.js";
import {inRadius} from "../scripts/helpers/FHelper.js";
import {UniqueSet} from "../scripts/helpers/UniqueSet.js";

export class Path{
    public node1: BasicNode
    public node2: BasicNode
    public armies: UniqueSet<Army,"originNode">

    constructor(node1: BasicNode, node2: BasicNode) {
        this.node1 = node1;
        this.node2 = node2;
        this.armies = new UniqueSet("originNode")
    }

    update(){
        this.moveArmies()

        for(const [_, army] of this.armies.entries()){
            if(army.count <= 0) continue;
            for(const [_, otherArmy] of this.armies.entries()){
                if(army === otherArmy || otherArmy.count <= 0){
                    continue
                }
                if(army.originNode !== otherArmy.originNode && inRadius(army.position, otherArmy.position, 10)){
                    const value = army.count
                    army.count -= otherArmy.count
                    otherArmy.count -= value
                    console.log(`Collision ${army.count} : ${otherArmy.count}`)
                    break
                }
            }
        }

        this.removeDeadArmies()
    }

    addArmy(newArmy: Army){
        this.armies.add(newArmy)
    }

    removeArmy(army: Army){
        this.armies.delete(army.originNode)
    }

    getOtherNode(node: BasicNode){
        if(!this.isNodeOnPath(node)){
            console.error(`Node ${node.id} is not on this path.`)
            return
        }

        return node === this.node1 ? this.node2 : this.node1
    }

    moveArmies(){
        for(const [_, army] of this.armies.entries()){
            army.moveToNextPosition()
        }
    }

    private removeDeadArmies(){
        for(const [_, army] of this.armies.entries()){
            if(army.count <= 0){
                this.armies.delete(army.originNode)
            }
        }
    }

    private isNodeOnPath(node: BasicNode){
        return node === this.node1 || node === this.node2
    }
}