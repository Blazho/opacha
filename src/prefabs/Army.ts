import {BasicNode} from "./node.js";
import {Position} from "../scripts/helpers/IHelper.js";
import {Path} from "./Path.js";
import {ControlGroup} from "../scripts/node/ControlGroup.js";

export class Army{
    public readonly id: string
    private readonly _originNode: BasicNode
    private readonly _controlGroup: ControlGroup
    private _count: number
    private path: Path
    private _position: Position

    constructor(originNode: BasicNode, path: Path) {
        this._originNode = originNode;
        this._count = originNode.getCurrentArmy();
        this.path = path
        this._position = {x: originNode.getPosition().x, y: originNode.getPosition().y}
        this._controlGroup = originNode.getGroup() ?? new ControlGroup("Neutral", "gray")
        this.id = originNode.getId() + Date.now()

        path.addArmy(this)
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.beginPath()
        ctx.arc(this._position.x, this._position.y, 10, 0, 2 * Math.PI)
        const group = this.group
        if(group){
            ctx.fillStyle = group.color
        }else {
            ctx.fillStyle = "gray"
        }
        ctx.fill()

        // Draw text
        ctx.font = '16px Verdana';
        ctx.fillStyle = "black";
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.count.toString(), this.position.x, this.position.y - 20)
    }

    nextPosition(): Position{
        const to = this.path.getOtherNode(this._originNode)
        if(!to){
            console.error(`Destination node does not exist`)
            return {x:0, y:0}
        }

        const dx = to.getPosition().x - this._position.x;
        const dy = to.getPosition().y - this._position.y;

        length = Math.sqrt(dx*dx + dy*dy);

        const nextX = this._position.x + dx / length * this.path.speed;
        const nextY = this._position.y + dy / length * this.path.speed;

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

    get group(): ControlGroup {
        return this._controlGroup;
    }

    get count(): number {
        return this._count;
    }

    get position(): Position {
        return this._position;
    }

    public static createNewArmy(path: Path, from: BasicNode){
        const army = new Army(from, path)
        path.addArmy(army)
        from.decrementArmy(from.getCurrentArmy())
    }
}