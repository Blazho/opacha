import {AbstractState} from "../FiniteStateScript.js";
import {BasicNode} from "../../prefabs/node.js";


export class IdleState extends AbstractState{
    override readonly stateName: string = "IdleState";
    private node: BasicNode


    constructor(node: BasicNode) {
        super();
        this.node = node;

    }

    onUpdate() {
        this.node.incrementArmy()
    }
}

export class SendState extends AbstractState{
    override readonly stateName: string = "SendState";
    private node: BasicNode
    private targetNode: BasicNode | null //todo bug target cant be in shared states


    constructor(node: BasicNode,  targetNode: BasicNode | null) {
        super();
        this.node = node;
        this.targetNode = targetNode;
    }

    onBegin() {
        console.log("SendState started");
    }

    onUpdate() {
        this.node.incrementArmy()
        this.node.sendArmyToTarget()

    }
}
