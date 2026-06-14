import {Predicate, StateMachine} from "../scripts/StateMachine.js";
import {AttackState, IdleState, SendState} from "../scripts/node/NodeStates.js";
import {UniqueSet} from "../scripts/helpers/UniqueSet.js";
import {AbstractState} from "../scripts/FiniteStateScript";
import {Pair, Position} from "../scripts/helpers/IHelper";
import {calculateDistance, lerp, lightenColor} from "../scripts/helpers/FHelper.js";
import {ControlGroup} from "../scripts/node/ControlGroup";

//todo separate structure from render
export class BasicNode {
    public readonly id: string; //for helping find duplicates
    private x: number; //todo use Position
    private y: number;
    private size: number
    private currentArmy: number
    private readonly incArmyCount: number
    public connectedTo : UniqueSet<BasicNode, "id">
    private stateMachine: StateMachine
    public targetNode: BasicNode | null
    private lastTargetedNode: BasicNode | null
    //reference to the group it belongs
    private group: ControlGroup | null
    isSelected = false //if player selected it

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
        this.group = null

        this.connectedTo = new UniqueSet<BasicNode, "id">("id")

        this.stateMachine = new StateMachine()
        this.states = new UniqueSet<AbstractState, "stateName">("stateName")
        this.initPossibleStates()


        this.setState("IdleState")
    }

    public getGroup(): ControlGroup | null { return this.group}
    public getLastSendInterval() { return this.lastSendInterval }
    public getId() { return this.id; }
    public getX() { return this.x; }
    public getY() { return this.y; }
    public getCurrentArmy() { return this.currentArmy; }
    public getSize() { return this.size; }

    private initPossibleStates(){

        const idleState = new IdleState(this)
        const sendState = new SendState(this)
        const attackState = new AttackState(this)

        //todo remove
        this.states.add(idleState)
        this.states.add(sendState)
        this.states.add(attackState)

        this.stateMachine.addTransition(idleState, sendState, new Predicate(() => {
            return this.targetNode !== null && this.targetNode.getGroup()?.name === this.group?.name
        }))
        this.stateMachine.addTransition(idleState, attackState, new Predicate(() => {
            return this.targetNode !== null && this.targetNode.getGroup()?.name !== this.group?.name
        }))
        this.stateMachine.addTransition(sendState, idleState, new Predicate(() => {
            return this.targetNode === null || this.group?.name !== this.targetNode.group?.name
        }))
        this.stateMachine.addTransition(attackState, idleState, new Predicate(() => this.targetNode === null))
        this.stateMachine.addTransition(attackState, sendState, new Predicate(() => {
            return this.targetNode !== null && this.group?.name === this.targetNode.group?.name
        }))
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

    public resetCurrentArmy(){
        this.currentArmy = 1
    }

    public setTargetNode(newTarget: BasicNode, isAttackTarget = false){
        if(newTarget === this){
            return;
        }
        if(!this.connectedTo.has(newTarget.id)){
            console.error(`Node ${newTarget.id} not connected to selected node ${this.id}`);
            return
        }
        this.targetNode = newTarget
    }

    public setGroup(newGroup: ControlGroup){
        this.group = newGroup
    }

    public clearGroup(){
        this.group = null
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



    public incrementArmy(){
        this.currentArmy += this.incArmyCount
    }

    public supplyArmy(value: number){
        this.currentArmy += value
    }

    //todo bugged
    public clearTarget(){
        this.lastTargetedNode = this.targetNode
        this.targetNode = null
        //So the last army is sent successfully
        //todo move to state logic
        setTimeout(() => {
            this.lastTargetedNode?.supplyArmy(10) //todo value
            this.lastTargetedNode = null
        }, 1000 - (Date.now() - this.lastSendInterval))
    }

    public decrementArmy(value: number){
        if(value > this.currentArmy){return;}
        this.currentArmy -= value
    }

    public attackTarget(){
        if(!this.targetNode !&& this.lastTargetedNode){
            console.error(`No target specified for node ${this.id}`)
            return
        }

        const value = this.currentArmy
        this.decrementArmy(value)
        this.lastSendInterval = Date.now()

        setTimeout(() => {
            if(this.targetNode)
            {
                this.targetNode.supplyArmy(-value)
                if(this.targetNode.currentArmy < 0 && this.group){
                    this.group.takeNode(this.targetNode)
                    this.targetNode.currentArmy = this.targetNode.currentArmy * -1
                }
            }else if (this.lastTargetedNode){
                this.lastTargetedNode.supplyArmy(-value)
                if(this.lastTargetedNode.currentArmy < 0 && this.group){
                    this.group.takeNode(this.lastTargetedNode)
                    this.lastTargetedNode.currentArmy = this.lastTargetedNode.currentArmy * -1
                }
            }
        }, 1000)
    }

    public supplyArmyToTarget(){
        if(!this.targetNode !&& this.lastTargetedNode){
            console.error(`No target specified for node ${this.id}`)
            return
        }

        const value = this.currentArmy
        this.decrementArmy(value)
        this.lastSendInterval = Date.now()

        //todo calc delay of supply over distance
        setTimeout(() => {
            if(this.targetNode)
            {
                this.targetNode.supplyArmy(value)
            }else if (this.lastTargetedNode){
                this.lastTargetedNode.supplyArmy(value)
            }
        }, 1000)
    }

    toString(){
        return `${this.id} - ${this.group?.name}`
    }

    drawNode(ctx: CanvasRenderingContext2D, color: string, selected: boolean = false) {
        let circleColor: Pair<string> = {
            left: color,
            right: 'black'
        }
        if(selected){
            circleColor = {
                left: lightenColor(color, 40),
                right: 'black'
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
        //todo refactor duplicate
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