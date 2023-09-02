import { Image } from "../model/Image";
import ActionsStore from "./ActionStore";
export declare abstract class Action<T> {
    childActions: Action<any>[];
    parentAction?: Action<any> | null;
    image: Image | null;
    subject: T;
    status: 'finish' | 'awaitingExecute' | 'awaitingBuild' | 'executing' | 'undo' | 'buildFailed' | 'executionFailed' | 'undoFailed' | 'redoFailed';
    actionID: string;
    actionStore: ActionsStore | null;
    constructor(subject: any, actionStore: ActionsStore, parent?: Action<any>);
    abstract build(config?: any): Promise<any>;
    abstract execute(config?: any): Promise<any>;
    finish(config?: any): Promise<void>;
    abstract undo(): Promise<any>;
    abstract redo(): Promise<any>;
    directExecute(): Promise<Action<T>>;
    destroy(): Promise<void>;
}
