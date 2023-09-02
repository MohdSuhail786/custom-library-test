import { Action } from "./AbstractAction";
import ActionsStore from "./ActionStore";
interface SampleActionIProps {
    parent?: Action<any>;
    actionsStore: ActionsStore;
}
export declare class SampleAction extends Action<any> {
    constructor(config: SampleActionIProps);
    build(): Promise<void>;
    execute(): Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
}
export {};
