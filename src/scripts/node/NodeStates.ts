import {AbstractState} from "../FiniteStateScript.js";
import {BasicNode} from "../../prefabs/node.js";
import {Army} from "../../prefabs/Army.js";
import {Path} from "../../prefabs/Path.js";


export class IdleState extends AbstractState{
    override readonly stateName: string = "IdleState";
    private node: BasicNode
    private lastIncrement: number

    constructor(node: BasicNode) {
        super();
        this.node = node;
        this.lastIncrement = Number.MAX_SAFE_INTEGER
    }

    onBegin() {
    }

    onUpdate(dt: number) {
        if(this.lastIncrement > 1){
            this.node.incrementArmy()
            this.lastIncrement = 0
        }
        this.lastIncrement += dt
    }

    onEnd() {
    }
}

export class SendState extends AbstractState{
    override readonly stateName: string = "SendState";
    private node: BasicNode
    private lastIncrement: number
    private lastSend: number
    private path: Path | null

    constructor(node: BasicNode) {
        super();
        this.node = node;
        this.lastIncrement = Number.MAX_SAFE_INTEGER
        this.lastSend = Number.MAX_SAFE_INTEGER
        this.path = null
    }

    onBegin() {
        this.path = this.node.getPathForTargetNode()
        if(this.path){
            Army.createNewArmy(this.path, this.node)
            this.lastSend = 0
        }
    }

    onUpdate(dt: number) {
        if(this.lastIncrement > 1){
            this.node.incrementArmy()
            this.lastIncrement = 0
        }
        this.lastIncrement += dt

        if(this.lastSend > 1){

            this.path = this.node.getPathForTargetNode()
            if(this.path){
                Army.createNewArmy(this.path, this.node)
                this.lastSend = 0
            }
        }
        this.lastSend += dt

    }

    onEnd() {
    }
}

export class AttackState extends AbstractState{
    override readonly stateName: string = "AttackState";
    private node: BasicNode
    private lastIncrement: number
    private lastAttack: number
    private path: Path | null

    constructor(node: BasicNode) {
        super();
        this.node = node;
        this.lastIncrement = Number.MAX_SAFE_INTEGER
        this.lastAttack = Number.MAX_SAFE_INTEGER
        this.path = null
    }

    onBegin() {
        this.path = this.node.getPathForTargetNode()
        if(this.path){
            Army.createNewArmy(this.path, this.node)
            this.lastAttack = 0
        }
    }

    onUpdate(dt: number) {
        if(this.lastIncrement > 1){
            this.node.incrementArmy()
            this.lastIncrement = 0
        }
        this.lastIncrement += dt

        if(this.lastAttack > 1){
            this.path = this.node.getPathForTargetNode()
            if(this.path){
                Army.createNewArmy(this.path, this.node)
                this.lastAttack = 0
            }
        }
        this.lastAttack += dt
    }

    onEnd() {

    }
}