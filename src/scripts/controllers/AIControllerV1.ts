import {ControlGroup} from "../node/ControlGroup.js";
import {BasicNode} from "../../prefabs/node.js";
import {GROUP_TYPES} from "../config/constants.js";
import {Controller} from "./Controller.js";

export class AIControllerV1 implements Controller{

    private controlGroup: ControlGroup
    private decisionInterval: number
    private processInterval: number | undefined


    constructor(controlGroup: ControlGroup, decisionInterval: number = 2000) {
        this.controlGroup = controlGroup;
        this.decisionInterval = decisionInterval;

        this.processInterval = setInterval(() => {
            this.process()
        }, this.decisionInterval)
    }

    getGroupName(): string {
        return this.controlGroup.name
    }

    public process() {
        for(const [_, node] of this.controlGroup.groupNodes.entries()){
            if(this.isAlert(node)){
                this.findAttackTarget(node)
            }else if(this.isSafe(node)) {
                this.findSupplyTarget(node)
            }else if(this.isNeutral(node)){
                this.findTakeoverTarget(node)
            }
        }
    }

    public stop() {
        clearInterval(this.processInterval)
    }

    // Node's status
    /**
     * Node is only connected with friendly nodes
    */
    private isSafe(node: BasicNode): boolean{
        for(const [_, conPath] of node.connectedTo.entries()){
            const otherNode = conPath.getOtherNode(node)
            if(otherNode && otherNode.getGroup() != node.getGroup()){
                return false
            }
        }
        return true
    }

    /**
     * Node is connected with friendly/neutral nodes
    */
    private isNeutral(node: BasicNode): boolean{
        for(const [_, conPath] of node.connectedTo.entries()){
            const otherNode = conPath.getOtherNode(node)
            if(otherNode &&
                otherNode.getGroup() != node.getGroup() &&
                otherNode.getGroup()?.name != GROUP_TYPES.NEUTRAL){
                return false
            }
        }
        return true
    }

    /**
     * Node is connected with at least one enemy node
    */
    private isAlert(node: BasicNode): boolean {
        for(const [_, conPath] of node.connectedTo.entries()){
            const otherGroup = conPath.getOtherNode(node)
            if(otherGroup &&
                otherGroup.getGroup() != node.getGroup() &&
                otherGroup.getGroup()?.name != GROUP_TYPES.NEUTRAL){
                return true
            }
        }
        return false
    }

    // Node's actions

    private setTarget(from: BasicNode, to: BasicNode){
        from.setTargetNode(to)
    }
    private clearTarget(node: BasicNode){
        node.clearTarget()
    }

    private findSupplyTarget(node: BasicNode) {
        let maxConPrim = 0
        let maxConSec = 0
        let primaryTargetNode: BasicNode | undefined
        let secondaryNode: BasicNode | undefined
        for(const [_, conPath] of node.connectedTo.entries()){
            const otherNode = conPath.getOtherNode(node)

            if(!otherNode) continue

            if(this.isAlert(otherNode) && maxConPrim < otherNode.connectedTo.length()){
                primaryTargetNode = otherNode
                maxConPrim = otherNode.connectedTo.length()
            }

            if(maxConSec < otherNode.connectedTo.length() && (this.isNeutral(otherNode) || this.isSafe(otherNode))){
                maxConSec = otherNode.connectedTo.length()
                secondaryNode = otherNode
            }

        }

        if(primaryTargetNode){
            this.setTarget(node, primaryTargetNode)
        }else if (secondaryNode){
            this.setTarget(node, secondaryNode)
        } else {
            this.clearTarget(node)
        }
    }

    private findTakeoverTarget(node: BasicNode) {
        let minArmy = Number.MAX_SAFE_INTEGER
        let targetNode: BasicNode | undefined
        for(const [_, conPath] of node.connectedTo.entries()){
            const otherNode = conPath.getOtherNode(node)

            if(!otherNode) continue

            const otherGroup = otherNode.getGroup()

            if(!otherGroup) continue

            if(otherGroup.name === GROUP_TYPES.NEUTRAL &&
                otherNode.getCurrentArmy() < minArmy){
                minArmy = otherNode.getCurrentArmy()
                targetNode = otherNode
            }
        }

        if(targetNode && targetNode.getCurrentArmy() + 5 < node.getCurrentArmy()){ //5 offset
            this.setTarget(node, targetNode)
        }else {
            this.clearTarget(node)
        }
    }

    private findAttackTarget(node: BasicNode) {
        let minArmy = Number.MAX_SAFE_INTEGER
        let targetNode: BasicNode | undefined
        for(const [_, conPath] of node.connectedTo.entries()){
            const otherNode = conPath.getOtherNode(node)

            if(!otherNode) continue

            const otherGroup = otherNode.getGroup()
            if(!otherGroup) continue

            const totalEnemyArmy = conPath.getOtherGroupPathArmy(otherGroup.name) + otherNode.getCurrentArmy()
            if((otherGroup.name === GROUP_TYPES.NEUTRAL || otherGroup.name !== node.getGroup()?.name) &&
                totalEnemyArmy < node.getCurrentArmy() &&
                totalEnemyArmy < minArmy){
                minArmy = totalEnemyArmy
                targetNode = otherNode
            }
        }
        if(targetNode && targetNode.getCurrentArmy() + 5 < node.getCurrentArmy()){ //5 offset
            this.setTarget(node, targetNode)
        }else {
            this.clearTarget(node)
        }
    }
}