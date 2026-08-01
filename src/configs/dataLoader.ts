import {LEVELS} from "../scripts/config/constants";
import {IBasicNode, IControlGroup, ILevel, IPath} from "./filesStructures";
import {BasicNode} from "../prefabs/node.js";
import {UniqueSet} from "../scripts/helpers/UniqueSet.js";
import {ControlGroup} from "../scripts/node/ControlGroup.js";

export async function fetchLevel(levelName: typeof LEVELS[keyof typeof LEVELS]){
    try {
        // 1. Fetch the local file relative to your script/HTML location
        const response = await fetch(`/data/${levelName}.json`);

        // 2. Check if the file exists and loaded correctly
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 3. Parse the stream into a usable JavaScript object
        return await response.json()
    } catch (error) {
        console.error("Could not fetch the JSON file:", error);
    }
}

export function parseJsonLevel(levelRaw: ILevel): UniqueSet<ControlGroup, "id">{
    const name = levelRaw.level
    const nodesRaw = levelRaw.nodes
    const groupsRaw = levelRaw.groups
    const pathsRaw = levelRaw.paths
    const nodes = createNodes(nodesRaw)
    const groups = createAllGroups(groupsRaw, nodes)
    connectAllNodes(pathsRaw, nodes)
    for(const [_, group] of groups.entries()){
        group.init()
    }
    return groups

}

export function pareJsonLevelTmp(levelRaw: ILevel):any {
    const name = levelRaw.level
    const nodesRaw = levelRaw.nodes
    const groupsRaw = levelRaw.groups
    const pathsRaw = levelRaw.paths

    const nodes = createNodes(nodesRaw)

    /**
     * render: nodes, path, army
     * physic: nodes, path, army, group
     * **/

}

function createNodes(nodes: IBasicNode[]): UniqueSet<BasicNode, "id">{
    const initNodes = new UniqueSet<BasicNode, "id">("id")
    for(const nodeRaw of nodes){
        const node = BasicNode.initNode(nodeRaw)
        initNodes.add(node)
    }
    return initNodes
}

function createGroup(groupRaw: IControlGroup, nodes: UniqueSet<BasicNode,"id">){
    const group = new ControlGroup(groupRaw.name, groupRaw.color)

    for(const nodeId of groupRaw.groupNodes){
        const node = nodes.get(nodeId)
        if(!node){
            console.error("Node not found")
        }else {
            group.addNode(node)
        }
    }

    return group
}

function createAllGroups(groupsRaw: IControlGroup[], nodes: UniqueSet<BasicNode, "id">){
    const groups = new UniqueSet<ControlGroup, "id">("id")
    for(const groupRaw of groupsRaw){
        const group = createGroup(groupRaw, nodes)
        groups.add(group)
    }
    return groups
}

function connectAllNodes(pathsRaw: IPath[], nodes: UniqueSet<BasicNode, "id">){
    for(const path of pathsRaw){
        const node1 = nodes.get(path.node1)
        const node2 = nodes.get(path.node2)
        if(!node1 || !node2){
            console.error(`Nodes ${path.node1} and/or ${path.node2} does not exist`)
            return
        }
        ControlGroup.addConnection(node1, node2)
    }
}