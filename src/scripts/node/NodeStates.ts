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
        console.log("SendState started");
        //To send immediate and not wait for delay
        this.node.sendArmyToTarget()

        this.sendInterval = setInterval(() => {
            this.node.sendArmyToTarget()
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
