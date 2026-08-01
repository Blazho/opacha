import {ControlGroup} from "../node/ControlGroup";
import {BasicNode} from "../../prefabs/node";
import {Controller} from "./Controller";

export class AIController implements Controller{
    private controlGroup: ControlGroup
    private decisionInterval: number
    private processInterval: number | undefined

    constructor(controlGroup: ControlGroup, decisionInterval = 2000) {
        this.controlGroup = controlGroup
        this.decisionInterval = decisionInterval

        this.processInterval = setInterval(() => {
            this.process()
        }, this.decisionInterval)
    }

    getGroupId(): string {
        return this.controlGroup.id
    }

    stop(): void {
        console.log(`${this.getGroupId()} stopped`)
        clearInterval(this.processInterval)
    }

    public process(){
        for(const [aiKey, aiNode] of this.controlGroup.groupNodes.entries()){
            let target : BasicNode | undefined

            let friendlyTarget: BasicNode | undefined
            let maxConnections = aiNode.connectedTo.length()
            for(const [conKey, conPath] of aiNode.connectedTo.entries()){
                const otherNode = conPath.getOtherNode(aiNode)
                if(otherNode && otherNode.getGroup() !== this.controlGroup){
                    this.clearAttackTarget(aiNode)
                    if(otherNode.getCurrentArmy() + 5 < aiNode.getCurrentArmy()) //threshold for incrementing node's army
                    {
                        target = otherNode
                        continue
                    }

                }

                if(!target && otherNode && otherNode.getGroup() === this.controlGroup
                    && otherNode.connectedTo.length() >= maxConnections){
                    maxConnections = otherNode.connectedTo.length()
                    friendlyTarget = otherNode
                }
            }

            if(target !== undefined){
                this.startSending(aiNode, target)
            }else {
                if(friendlyTarget !== undefined){
                    this.startSending(aiNode, friendlyTarget)
                }
            }

        }
    }

    private startSending(from: BasicNode, to: BasicNode){
        from.setTargetNode(to)
    }

    private clearAttackTarget(node: BasicNode){
        node.clearTarget()
    }
}