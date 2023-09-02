import { Vector2d } from "konva/lib/types";
import { Action } from "./AbstractAction";
import { Box } from "../model/Box";
import { Image } from "../model/Image";
import ActionsStore from "./ActionStore";
interface CreateBoxActionIProps {
    parent?: Action<any>;
    pos: Vector2d;
    image: Image;
    actionsStore: ActionsStore;
}
export declare class CreateBoxAction extends Action<Box> {
    pos: Vector2d | null;
    constructor(config: CreateBoxActionIProps);
    build(): Promise<void>;
    execute(pos: Vector2d): Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
}
export {};
