import {Predicate, StateMachine} from "../scripts/StateMachine.js";
import {AttackState, IdleState, SendState} from "../scripts/node/NodeStates.js";
import {UniqueSet} from "../scripts/helpers/UniqueSet.js";
import {AbstractState} from "../scripts/FiniteStateScript";
import {Pair, Position} from "../scripts/helpers/IHelper";
import { inRadius, lerp, lightenColor} from "../scripts/helpers/FHelper.js";
import {ControlGroup} from "../scripts/node/ControlGroup";
import {Path} from "./Path";

//todo separate structure from render
export class BasicNode {
    public readonly id: string; //for helping find duplicates
    private readonly position: Position
    private readonly size: number
    private currentArmy: number
    private readonly incArmyCount: number
    public connectedTo : UniqueSet<Path, "id">
    private stateMachine: StateMachine
    public targetNode: BasicNode | null
    //reference to the group it belongs
    private group: ControlGroup | null
    isSelected = false //if player selected it

    private states: UniqueSet<AbstractState, "stateName">
    private lastSendInterval: number;

    constructor(id: string,
                x: number = 50,
                y: number = 50,
                incArmyCount: number = 1,
                currentArmy: number = 0,
                radius: number = 50,
    ) {
        this.id = id
        this.position = { x: x, y: y}
        this.size = radius;
        this.incArmyCount = incArmyCount;
        this.currentArmy = currentArmy;
        this.targetNode = null
        this.lastSendInterval = 0
        this.group = null

        this.connectedTo = new UniqueSet<Path, "id">("id")

        this.stateMachine = new StateMachine()
        this.states = new UniqueSet<AbstractState, "stateName">("stateName")
        this.initPossibleStates()


        this.setState("IdleState")
    }

    public getGroup(): ControlGroup | null { return this.group}
    public getId() { return this.id; }
    public getPosition() { return this.position}
    public getCurrentArmy() { return this.currentArmy; }
    public getSize() { return this.size; }

    public update() {
        this.stateMachine.update();
        this.updatePaths()
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

    public setTargetNode(newTarget: BasicNode){
        if(newTarget === this){
            return;
        }
        if(!this.connectedTo.containInAnyKey(newTarget.id)){
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
        return inRadius(this.position, position, this.size)
    }

    public addPath(path: Path){
        if(path.node1 !== this && path.node2 !== this){
            console.error(`This node ${this.id} is not on this path`)
            return
        }

        this.connectedTo.add(path)
    }

    public getPathForTargetNode(){
        if (!this.targetNode){
            console.warn("No target node")
            return null
        }
        for(const [_, path] of this.connectedTo.entries()){
            if(path.node1 === this.targetNode || path.node2 === this.targetNode){
                return path
            }
        }
        return null
    }

    public incrementArmy(){
        this.currentArmy += this.incArmyCount
    }

    public supplyArmy(value: number){
        this.currentArmy += value
    }

    public clearTarget(){
        this.targetNode = null
    }

    public decrementArmy(value: number){
        if(value > this.currentArmy){return false;}
        this.currentArmy -= value
        return true
    }
    /**
     * Subtract army form this node and give control to the attacker if the attack army is greater than the army stationed on this node
     **/
    public attackNode(attackArmy: number, attackerGroup: ControlGroup){
        if(this.currentArmy > attackArmy){
            this.currentArmy -= attackArmy
        }else {
            this.currentArmy = Math.abs(this.currentArmy - attackArmy)
            attackerGroup.takeNode(this)
            this.setState("IdleState")
            this.clearTarget()
        }
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
        ctx.arc(this.position.x, this.position.y, this.size, 0 , 2 * Math.PI)
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
        ctx.fillText(this.currentArmy.toString(), this.position.x, this.position.y)
    }

    drawTransfer(ctx: CanvasRenderingContext2D, color: string){
        if(this.targetNode){
            const progress: number = (Date.now() - this.lastSendInterval ) / 1000
            ctx.beginPath()
            const currX = lerp(this.position.x, this.targetNode.position.x, progress)
            const currY = lerp(this.position.y, this.targetNode.position.y, progress)
            ctx.arc(currX, currY, 10, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
        }
    }

    drawPathAndArmies(ctx: CanvasRenderingContext2D){
        for(const [_, path] of this.connectedTo.entries()){
            path.draw(ctx)
        }
    }

    private updatePaths(){
        for(const [_, path] of this.connectedTo.entries()){
            path.update()
        }
    }

    private initPossibleStates(){

        const idleState = new IdleState(this)
        const sendState = new SendState(this)
        const attackState = new AttackState(this)

        //todo refactor if possible
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
}