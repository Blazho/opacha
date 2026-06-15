import {BasicNode} from "./node";
import {Position} from "../scripts/helpers/IHelper";
import {Path} from "./Path";

export class Army{
    private _originNode: BasicNode
    private _count: number
    private path: Path
    private _position: Position
    private speed: number

    constructor(originNode: BasicNode, count: number, path: Path, speed: number) {
        this._originNode = originNode;
        this._count = count;
        this.path = path
        this._position = { x: originNode.getX(), y:originNode.getY()};
        this.speed = speed;

        path.addArmy(this)
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.beginPath()
        ctx.arc(this._position.x, this._position.y, 10, 0, 2 * Math.PI)
        const group = this._originNode.getGroup()
        if(group){
            ctx.fillStyle = group.color
        }else {
            ctx.fillStyle = "gray"
        }
        ctx.fill()
    }

    nextPosition(): Position{
        const to = this.path.getOtherNode(this._originNode)
        if(!to){
            console.error(`Destination node does not exist`)
            return {x:0, y:0}
        }

        const dx = to.getX() - this._position.x;
        const dy = to.getY() - this._position.y;

        length = Math.sqrt(dx*dx + dy*dy);

        const nextX = this._position.x + dx / length * this.speed;
        const nextY = this._position.y + dy / length * this.speed;

        return {x: nextX, y: nextY}
    }

    set count(value: number) {
        this._count = value;
    }

    moveToNextPosition(){
        this._position = this.nextPosition()
    }


    get originNode(): BasicNode {
        return this._originNode;
    }

    get count(): number {
        return this._count;
    }

    get position(): Position {
        return this._position;
    }
}