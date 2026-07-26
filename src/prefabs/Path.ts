import {BasicNode} from "./node.js";
import {Army} from "./Army.js";
import {inRadius} from "../scripts/helpers/FHelper.js";
import {UniqueSet} from "../scripts/helpers/UniqueSet.js";
import {Position} from "../scripts/helpers/IHelper";

export class Path{
    public id: string
    public node1: BasicNode
    public node2: BasicNode
    public armies: UniqueSet<Army,"id">
    public speed: number

    constructor(node1: BasicNode, node2: BasicNode, speed = 50) {
        this.node1 = node1;
        this.node2 = node2;
        this.armies = new UniqueSet("id")
        this.id = node1.id + "-" + node2.id;
        this.speed = speed
    }

    update(dt: number){
        if(this.armies.length() === 0) return

        this.moveArmies(dt)

        this.checkArmiesForCollision()
        this.checkArmiesIfReached()
        this.removeDeadArmies()
    }

    draw(ctx: CanvasRenderingContext2D){
        this.drawPath(ctx)
        this.drawArmies(ctx)
    }

    addArmy(newArmy: Army){
        this.armies.add(newArmy)
    }

    getOtherNode(node: BasicNode){
        if(!this.isNodeOnPath(node)){
            console.error(`Node ${node.id} is not on this path.`)
            return
        }

        return node === this.node1 ? this.node2 : this.node1
    }

    getOtherGroupPathArmy(groupName: string){
        let total = 0
        for(const [_, army] of this.armies.entries()){
            if(army.group.name === groupName){
                total += army.count
            }
        }
        return total
    }

    moveArmies(dt: number){
        for(const [_, army] of this.armies.entries()){
            army.moveToNextPosition(dt)
        }
    }

    private checkArmiesForCollision(){
        for(const [_, army] of this.armies.entries()){
            if(army.count <= 0) continue;
            for(const [_, otherArmy] of this.armies.entries()){
                if(army === otherArmy || otherArmy.count <= 0){
                    continue
                }
                if(army.group !== otherArmy.group && inRadius(army.position, otherArmy.position, Army.radius)){
                    const value = army.count
                    army.count -= otherArmy.count
                    otherArmy.count -= value
                    break
                }
            }
        }
    }

    private checkArmiesIfReached(){
        for(const [_, army] of this.armies.entries()){
            const destinationNode = this.getOtherNode(army.originNode)
            if(!destinationNode){
                console.error(`Army ${army.id} cannot reach destination`)
                return
            }

            if(this.reachedDestination(army, destinationNode.getPosition())){
                const originGroup = army.group
                if(destinationNode.getGroup() === originGroup){
                    destinationNode.supplyArmy(army.count)
                }else {
                    destinationNode.attackNode(army.count, originGroup)
                }
                army.count = 0
            }
        }
    }

    private reachedDestination(army: Army, destinationPosition: Position){
        return inRadius(army.position, destinationPosition, 1);  //1 radius so the army does not overshoot and collision is not detected
    }

    private drawPath(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.moveTo(this.node1.getPosition().x, this.node1.getPosition().y); // Start point
        ctx.lineTo(this.node2.getPosition().x, this.node2.getPosition().y); // End point
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    private drawArmies(ctx: CanvasRenderingContext2D){
        for(const [_, army] of this.armies.entries()){
            army.draw(ctx)
        }
    }

    private removeDeadArmies(){
        for(const [_, army] of this.armies.entries()){
            if(army.count <= 0){
                this.armies.delete(army.id)
            }
        }
    }

    private isNodeOnPath(node: BasicNode){
        return node === this.node1 || node === this.node2
    }
}