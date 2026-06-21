import {State} from "./FiniteStateScript.js";

export class StateMachine{
    private current: StateNode | undefined
    /**
     * Keeps all possible StateNodes
     *
     * key - state node name [string]
     *
     * value - StateNode
     */
    private stateMap: Map<string, StateNode> = new Map();
    /**
     * Keeps transitions from any state
     * Possible Duplicates
     */
    private anyTransitions: Set<ITransition> = new Set();

    public update(){
        const transition = this.getTransition()
        if(transition){
            this.changeState(transition.to)
        }

        this.current?.state.onUpdate()
    }

    public setState(state: State){
        this.current = this.getOrAddNode(state);
        this.current.state.onBegin()
    }

    public changeState(state: State){
        if(this.current?.state === state){ return; }

        const prevState = this.current?.state
        const nextState = this.getOrAddNode(state)

        prevState?.onEnd()
        nextState.state.onBegin()

        this.current = nextState
    }

    public addTransition(from: State, to: State, condition: Predicate) {
        this.getOrAddNode(from).addTransition(this.getOrAddNode(to).state, condition)
    }

    public addAnyTransition(to: State, condition: Predicate) {
        this.anyTransitions.add({
            to: this.getOrAddNode(to).state,
            condition: condition,
        })
    }

    public getStateName(): string{
        return this.current?.state.constructor.name ?? ""
    }

    private getOrAddNode(state: State): StateNode{
        const node = this.stateMap.get(state.constructor.name)
        if (node) {
            return node;
        }

        const newNode = new StateNode(state)
        this.stateMap.set(state.constructor.name, newNode);
        return newNode;
    }

    private getTransition(): ITransition | null{
        for (const t of this.anyTransitions){
            if(t.condition.check()){
                return t;
            }
        }
        if(this.current){
            for (const t of this.current.transitions){
                if(t.condition.check()){
                    return t;
                }
            }
        }
        return null
    }
}

export class Predicate {
    private readonly func: () => boolean;

    constructor(func: () => boolean) {
        this.func = func;
    }

    public check(): boolean {
        return this.func();
    }
}

export interface ITransition{
    to: State,
    condition: Predicate
}

export class StateNode{
    state: State;
    transitions: Set<ITransition> = new Set();

    constructor(state: State) {
        this.state = state;
    }

    public addTransition(to: State, condition: Predicate) {
        this.transitions.add( {
            to: to,
            condition: condition
        })
    }
}