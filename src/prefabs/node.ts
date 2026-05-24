import {StateMachine} from "../scripts/StateMachine.js";
import {IdleState, SendState} from "../scripts/node/NodeStates.js";
import {UniqueSet} from "../scripts/helpers/UniqueSet.js";
import {AbstractState} from "../scripts/FiniteStateScript";
import {Pair, Position} from "../scripts/helpers/IHelper";
import {calculateDistance, lerp} from "../scripts/helpers/FHelper.js";

//todo separate structure from render
export class BasicNode {
    public readonly id: string; //for helping find duplicates
    private x: number;
    private y: number;
    private size: number
    private currentArmy: number
    private readonly incArmyCount: number
    public connectedTo : UniqueSet<BasicNode, "id">
    private stateMachine: StateMachine
    private targetNode: BasicNode | null
    private lastTargetedNode: BasicNode | null

    private states: UniqueSet<AbstractState, "stateName">
    private lastSendInterval: number;

    constructor(id: string,
                x: number = 50,
                y: number = 50,
                radius: number = 50,
                incArmyCount: number = 1,
                currentArmy: number = 0,
    ) {
        this.id = id
        this.x = x;
        this.y = y;
        this.size = radius;
        this.incArmyCount = incArmyCount;
        this.currentArmy = currentArmy;
        this.targetNode = null
        this.lastTargetedNode = null
        this.lastSendInterval = 0

        this.connectedTo = new UniqueSet<BasicNode, "id">("id")

        this.stateMachine = new StateMachine()
        //todo move it to upper layer
        this.states = new UniqueSet<AbstractState, "stateName">("stateName")
        this.initPossibleStates()


        this.setState("IdleState")
    }
    private initPossibleStates(){

        const idleState = new IdleState(this)
        const sendState = new SendState(this)

        this.states.add(idleState)
        this.states.add(sendState)
    }

    public update() {
        this.stateMachine.update();
    }
    //todo find better way instead of string
    public setState(newState: string){
        const loadedState = this.states.get(newState);
        if(loadedState == undefined){
            console.error("State not found");
            return;
        }
        this.stateMachine.changeState(loadedState)
    }

    public setTargetNode(newTarget: BasicNode){
        if(newTarget === this){
            return;
        }
        if(!this.connectedTo.has(newTarget.id)){
            console.error(`Node ${newTarget.id} not connected to selected node ${this.id}`);
            return
        }
        this.targetNode = newTarget
        this.setState("SendState")
    }

    public isInsideNode(position: Position): boolean{
        return calculateDistance(this.x, this.y, position.x, position.y) <= this.size
    }

    public addConnection(connection: BasicNode): BasicNode{
        this.connectedTo.add(connection);
        return this
    }

    public removeConnection(connectionId: string): BasicNode{
        this.connectedTo.delete(connectionId);
        return this
    }

    public getLastSendInterval() { return this.lastSendInterval }
    public getId() { return this.id; }
    public getX() { return this.x; }
    public getY() { return this.y; }
    public getCurrentArmy() { return this.currentArmy; }
    public getSize() { return this.size; }

    public incrementArmy(){
        this.currentArmy += this.incArmyCount
    }

    public supplyArmy(value: number){
        this.currentArmy += value
    }

    public clearTarget(){
        this.lastTargetedNode = this.targetNode
        this.targetNode = null
        //So the last army is sent successfully
        setTimeout(() => {
            this.lastTargetedNode?.supplyArmy(10) //todo value
            this.lastTargetedNode = null
        }, 1000 - (Date.now() - this.lastSendInterval))
    }

    public decrementArmy(value: number){
        if(value > this.currentArmy){return;}
        this.currentArmy -= value
    }

    public sendArmyToTarget(){
        if(!this.targetNode !&& this.lastTargetedNode){
            console.error(`No target specified for node ${this.id}`)
            return
        }

        const value = this.currentArmy > 10 ? 10 : this.currentArmy
        this.decrementArmy(value)
        this.lastSendInterval = Date.now()

        //todo calc delay of supply over distance
        // const distance = calculateDistance(this.x, this.y, this.targetNode.x, this.targetNode.y)
        // setTimeout(() => this.targetNode!.supplyArmy(value), distance)
        setTimeout(() => {
            if(this.targetNode)
            {
                this.targetNode.supplyArmy(value)
            }else if (this.lastTargetedNode){
                this.lastTargetedNode.supplyArmy(value)
            }
        }, 1000)
    }

    drawNode(ctx: CanvasRenderingContext2D, color: string, selected: boolean = false) {
        let circleColor: Pair<string> = {
            left: color,
            right: 'black'
        }
        if(selected){
            circleColor = {
                left: '#2980b9',
                right: '#3498db'
            }
        }

        // Draw circle
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0 , 2 * Math.PI)
        ctx.fillStyle = circleColor.left; // Circle fill color
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = circleColor.right; // Circle border color
        ctx.stroke();

        // Draw text
        ctx.font = '20px Verdana';
        ctx.fillStyle = this.stateMachine.getStateName() === "IdleState" ? "white" : "red";
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.currentArmy.toString(), this.x, this.y)
    }

    drawTransfer(ctx: CanvasRenderingContext2D, color: string){
        if(this.targetNode){
            const progress: number = (Date.now() - this.lastSendInterval ) / 1000
            ctx.beginPath()
            const currX = lerp(this.x, this.targetNode.getX(), progress)
            const currY = lerp(this.y, this.targetNode.getY(), progress)
            ctx.arc(currX, currY, 10, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
        }
        if (this.lastTargetedNode){
            const progress: number = (Date.now() - this.lastSendInterval ) / 1000
            ctx.beginPath()
            const currX = lerp(this.x, this.lastTargetedNode.getX(), progress)
            const currY = lerp(this.y, this.lastTargetedNode.getY(), progress)
            ctx.arc(currX, currY, 10, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
        }
    }
}