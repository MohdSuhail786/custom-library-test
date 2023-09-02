import { Vector2d } from "konva/lib/types";
import { Box } from "../model/Box";
import { Action } from "./AbstractAction";
import ActionsStore from "./ActionStore";
interface BoxMoveActionIProps {
    parent?: Action<any>;
    actionsStore: ActionsStore;
    box: Box;
}
export declare class BoxMoveAction extends Action<Box> {
    oldPosition: Vector2d | null;
    newPosition: Vector2d | null;
    constructor(config: BoxMoveActionIProps);
    build(): Promise<void>;
    execute(): Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
}
export {};
