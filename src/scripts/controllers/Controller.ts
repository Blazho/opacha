export abstract class Controller{
    abstract process(): void
    abstract stop(): void
    abstract getGroupName(): string
}