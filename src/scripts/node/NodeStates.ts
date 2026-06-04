import {AbstractState} from "../FiniteStateScript.js";
import {BasicNode} from "../../prefabs/node.js";


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

    constructor(node: BasicNode) {
        super();
        this.node = node;
        this.sendInterval = 0
    }

    onBegin() {
        console.log("SendState started");
        //To send immediate and not wait for delay
        this.node.supplyArmyToTarget()

        this.sendInterval = setInterval(() => {
            this.node.supplyArmyToTarget()
            this.node.incrementArmy()
        }, 1000)
    }

    onUpdate() {
    }

    onEnd() {
        console.log("SendState ended")
        clearInterval(this.sendInterval)
    }
}

export class AttackState extends AbstractState{
    override readonly stateName: string = "AttackState";
    private node: BasicNode
    private sendInterval: number

    constructor(node: BasicNode) {
        super();
        this.node = node;
        this.sendInterval = 0
    }

    onBegin() {
        console.log("AttackState started");
        //To send immediate and not wait for delay
        this.node.attackTarget()

        this.sendInterval = setInterval(() => {
            this.node.attackTarget()
            this.node.incrementArmy()
        }, 1000)
    }

    onUpdate() {
    }

    onEnd() {
        console.log("AttackState ended")
        clearInterval(this.sendInterval)
    }
}