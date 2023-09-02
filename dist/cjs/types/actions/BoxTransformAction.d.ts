import { Anchor, Box } from "../model/Box";
import { IMBox } from "../model/Types";
import { Action } from "./AbstractAction";
import ActionsStore from "./ActionStore";
interface BoxTransformActionIProps {
    parent?: Action<any>;
    actionsStore: ActionsStore;
    box: Box;
    anchor: Anchor;
}
export declare class BoxTransformAction extends Action<Box> {
    anchor: Anchor | null;
    oldPosition: IMBox | null;
    newPosition: IMBox | null;
    constructor(config: BoxTransformActionIProps);
    build(): Promise<void>;
    execute(): Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
}
export {};
