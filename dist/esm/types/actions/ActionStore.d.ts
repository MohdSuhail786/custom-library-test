import { Action } from "./AbstractAction";
declare class ActionsStore {
    ActionsList: Action<any>[];
    index: number;
    maxLength: number;
    constructor();
    push(action: Action<any>): void;
    undo(): Promise<void>;
    redo(): Promise<void>;
}
export default ActionsStore;
