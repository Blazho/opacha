import {UniqueSet} from "./UniqueSet";
import {GameObject, RenderObject} from "../render/RenderObject";
import {ControlGroup} from "../node/ControlGroup";

export interface Position {
    x:number
    y:number
}

export interface Pair<T, K>{
    left: T,
    right: K
}

export interface LevelData{
    renderObjects: UniqueSet<RenderObject, "id">,
    gameObjects: UniqueSet<GameObject, "id">,
    groups: UniqueSet<ControlGroup, "id">,
    levelName: string
}