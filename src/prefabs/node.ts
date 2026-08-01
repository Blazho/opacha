import {Predicate, StateMachine} from "../scripts/StateMachine.js";
import {AttackState, IdleState, SendState} from "../scripts/node/NodeStates.js";
import {UniqueSet} from "../scripts/helpers/UniqueSet.js";
import {AbstractState} from "../scripts/FiniteStateScript";
import {Pair, Position} from "../scripts/helpers/IHelper";
import {inRadius, lerp, lightenColor} from "../scripts/helpers/FHelper.js";
import {ControlGroup} from "../scripts/node/ControlGroup";
import {Path} from "./Path";
import {IBasicNode} from "../configs/filesStructures";

//todo separate structure from render
export class BasicNode extends RenderObject{
    private readonly position: Position
    private readonly size: number
    private currentArmy: number
    private incArmyCount: number
    public connectedTo : UniqueSet<Path, "id">
    private stateMachine: StateMachine
    public targetNode: BasicNode | null
    //reference to the group it belongs
    private group: ControlGroup | undefined
    isSelected = false //if player selected it

    private states: UniqueSet<AbstractState, "stateName">

    constructor(id: string,
                x: number = 50,
                y: number = 50,
                incArmyCount: number = 1,
                currentArmy: number = 0,
                radius: number = 50,
    ) {
        super(id)
        this.position = { x: x, y: y}
        this.size = radius;
        this.incArmyCount = incArmyCount;
        this.currentArmy = currentArmy;
        this.targetNode = null

        this.connectedTo = new UniqueSet<Path, "id">("id")

        this.stateMachine = new StateMachine()
        this.states = new UniqueSet<AbstractState, "stateName">("stateName")
        this.initPossibleStates()


        this.setState("IdleState")
    }

    public static initNode(nodeRaw: IBasicNode): BasicNode{
        const id = nodeRaw.id
        const position = { x: nodeRaw.x, y: nodeRaw.y}
        const incArmyCount = nodeRaw.incArmyCount ?? 1
        const currentArmy = nodeRaw.currentArmy ?? 0
        const size = nodeRaw.radius ?? 50

        return new BasicNode(id, position.x, position.y, incArmyCount, currentArmy, size)
    }

    public getGroup(): ControlGroup | undefined { return this.group}
    public getId() { return this.id; }
    public getPosition() { return this.position}
    public getCurrentArmy() { return this.currentArmy; }
    public getSize() { return this.size; }

    public update(dt: number) {
        this.stateMachine.update(dt);
        this.updatePaths(dt)
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
        if(!this.connectedTo.containInAnyKey(newTarget.id)){
            console.error(`Node ${newTarget.id} not connected to selected node ${this.id}`);
            return
        }
        this.targetNode = newTarget
    }

    public setGroup(newGroup: ControlGroup){
        this.group = newGroup
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
            this.incArmyCount = 1
            this.setState("IdleState")
            this.clearTarget()
        }
    }

    toString(){
        return `${this.id} - ${this.group?.id}`
    }

    render(ctx: CanvasRenderingContext2D) {
        let circleColor: Pair<string, string> = {
            left: this.group?.color || "#ccc",
            right: 'black'
        }
        if(this.isSelected){
            circleColor = {
                left: lightenColor(this.group?.color || "#ccc", 40),
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

    drawPathAndArmies(ctx: CanvasRenderingContext2D){
        //todo refactor to use render engine
        for(const [_, path] of this.connectedTo.entries()){
            path.render(ctx)
        }
    }

    private updatePaths(dt: number){
        for(const [_, path] of this.connectedTo.entries()){
            path.update(dt)
        }
    }

    private initPossibleStates(){

        const idleState = new IdleState(this)
        const sendState = new SendState(this)
        const attackState = new AttackState(this)

        this.states.add(idleState)
        this.states.add(sendState)
        this.states.add(attackState)

        this.stateMachine.addTransition(idleState, sendState, new Predicate(() => {
            return this.targetNode !== null && this.targetNode.getGroup()?.id === this.group?.id
        }))
        this.stateMachine.addTransition(idleState, attackState, new Predicate(() => {
            return this.targetNode !== null && this.targetNode.getGroup()?.id !== this.group?.id
        }))
        this.stateMachine.addTransition(sendState, idleState, new Predicate(() => {
            return this.targetNode === null || this.group?.id !== this.targetNode.group?.id
        }))
        this.stateMachine.addTransition(attackState, idleState, new Predicate(() => this.targetNode === null))
        this.stateMachine.addTransition(attackState, sendState, new Predicate(() => {
            return this.targetNode !== null && this.group?.id === this.targetNode.group?.id
        }))
    }
}