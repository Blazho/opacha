export interface IBasicNode{
    id: string,
    x: number,
    y: number,
    incArmyCount?: number,
    currentArmy?: number,
    radius?: number,
    connectedTo: string[]
}

export interface IControlGroup{
    name: string,
    color: string,
    groupNodes: string[],
}

export interface IPath{
    node1: string,
    node2: string,
    speed?: number
}

export interface ILevel{
    level: string
    nodes: IBasicNode[],
    groups: IControlGroup[],
    paths: IPath[]
}
