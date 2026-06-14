import {BasicNode} from "./node";
import {Position} from "../scripts/helpers/IHelper";
import {Path} from "./Path";
import {inRadius} from "../scripts/helpers/FHelper.js";

export class Army{
    private originNode: BasicNode
    public count: number
    private path: Path
    private position: Position
    private speed: number

    constructor(originNode: BasicNode, count: number, path: Path, speed: number) {
        this.originNode = originNode;
        this.count = count;
        this.path = path
        this.position = { x: originNode.getX(), y:originNode.getY()};
        this.speed = speed;

        path.addArmy(this)
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI)
        const group = this.originNode.getGroup()
        if(group){
            ctx.fillStyle = group.color
        }else {
            ctx.fillStyle = "gray"
        }
        ctx.fill()
    }

    nextPosition(): Position{
        const to = this.path.getOtherNode(this.originNode)
        if(!to){
            console.error(`Destination node does not exist`)
            return {x:0, y:0}
        }

        const dx = to.getX() - this.position.x;
        const dy = to.getY() - this.position.y;

        length = Math.sqrt(dx*dx + dy*dy);

        const nextX = this.position.x + dx / length * this.speed;
        const nextY = this.position.y + dy / length * this.speed;

        return {x: nextX, y: nextY}
    }

    moveToNextPosition(){
        this.position = this.nextPosition()
        let otherArmyCollision = this.checkCollisionOnPath()
         if(otherArmyCollision){
             console.log(`Collision between armies happened`)
             console.log(`${this.count} - ${otherArmyCollision.count} : ${this.count - otherArmyCollision.count}`)
             const value = this.count
             this.count -= otherArmyCollision.count
             otherArmyCollision.count -= value

        }
    }

    checkCollisionOnPath(){
        for (const otherArmy of this.path.armies) {
            if(otherArmy === this) continue;

            if(inRadius(this.position, otherArmy.position, 10)){
                return otherArmy
            }
        }

        return null
    }
}