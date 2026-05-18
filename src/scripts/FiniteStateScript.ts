export interface State {
    onBegin(): void;
    onUpdate(): void;
    onEnd(): void;
}

export abstract class AbstractState implements State{
    readonly stateName: string = "AbstractState";

    onBegin(): void {
    }

    onEnd(): void {
    }

    onUpdate(): void {
    }

}
