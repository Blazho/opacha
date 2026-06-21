import {ControlGroup} from "../node/ControlGroup";
import {BasicNode} from "../../prefabs/node";

export class AIController{
    private controlGroup: ControlGroup
    private decisionInterval: number
    private processInterval: number | undefined

    constructor(controlGroup: ControlGroup, decisionInterval = 2000) {
        this.controlGroup = controlGroup
        this.decisionInterval = decisionInterval

        this.processInterval = setInterval(() => {
            this.process()
        }, decisionInterval)
    }

    private process(){
        for(const [aiKey, aiNode] of this.controlGroup.groupNodes.entries()){
            let target : BasicNode | undefined
            let minArmy = Number.MAX_SAFE_INTEGER

            let friendlyTarget: BasicNode | undefined
            let maxConnections = 0
            for(const [conKey, conPath] of aiNode.connectedTo.entries()){
                const otherNode = conPath.getOtherNode(aiNode)
                if(otherNode && otherNode.getGroup() !== this.controlGroup && otherNode.getCurrentArmy() + 5< aiNode.getCurrentArmy() && otherNode.getCurrentArmy() < minArmy ) //threshold
                {
                    console.log(`New target ${otherNode} Old target ${target}`)
                    minArmy = otherNode.getCurrentArmy()
                    target = otherNode
                }
                if(otherNode && otherNode.getGroup() === this.controlGroup && otherNode.connectedTo.length() > maxConnections){
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