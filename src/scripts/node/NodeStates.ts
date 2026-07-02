import {AbstractState} from "../FiniteStateScript.js";
import {BasicNode} from "../../prefabs/node.js";
import {Army} from "../../prefabs/Army.js";


export class IdleState extends AbstractState{
    override readonly stateName: string = "IdleState";
    private node: BasicNode
    private incrementArmyInterval: number

    constructor(node: BasicNode) {
        super();
        this.node = node;
        this.incrementArmyInterval = 0
    }

    onBegin() {
        this.node.clearTarget()
        this.incrementArmyInterval = setInterval(() => {
            this.node.incrementArmy()
        }, 1000)
    }

    onUpdate() {
    }

    onEnd() {
        clearInterval(this.incrementArmyInterval)
    }
}

export class SendState extends AbstractState{
    override readonly stateName: string = "SendState";
    private node: BasicNode
    private sendInterval: number
    private incrementArmyInterval: number

    constructor(node: BasicNode) {
        super();
        this.node = node;
        this.sendInterval = 0
        this.incrementArmyInterval = 0
    }

    onBegin() {
        this.incrementArmyInterval = setInterval(() => {
            this.node.incrementArmy()
        }, 1000)

        const path = this.node.getPathForTargetNode()
        if(path){
            //Send immediately and wait for the interval
            Army.createNewArmy(path, this.node)

            this.sendInterval = setInterval(() => {
                Army.createNewArmy(path, this.node)
            }, 1000)
        }
    }

    onUpdate() {
    }

    onEnd() {
        clearInterval(this.sendInterval)
        clearInterval(this.incrementArmyInterval)
    }
}

export class AttackState extends AbstractState{
    override readonly stateName: string = "AttackState";
    private node: BasicNode
    private sendInterval: number
    private incrementArmyInterval: number

    constructor(node: BasicNode) {
        super();
        this.node = node;
        this.sendInterval = 0
        this.incrementArmyInterval = 0
    }

    onBegin() {
        this.incrementArmyInterval = setInterval(() => {
            this.node.incrementArmy()
        }, 1000)

        const path = this.node.getPathForTargetNode()
        if(path){
            //Send immediately and wait for the interval
            Army.createNewArmy(path, this.node)

            this.sendInterval = setInterval(() => {
                Army.createNewArmy(path, this.node)
            }, 1000)
        }
    }

    onUpdate() {
    }

    onEnd() {
        clearInterval(this.sendInterval)
        clearInterval(this.incrementArmyInterval)
    }
}