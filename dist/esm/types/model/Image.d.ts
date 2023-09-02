import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Editor } from "./Editor";
import { Box } from "./Box";
import { CreateBoxAction } from "../actions/CreateBoxAction";
import { IMBox } from "./Types";
import ActionsStore from "../actions/ActionStore";
export interface ImageConfig extends Konva.ImageConfig {
    editor: Editor;
    src: string;
    imBoxes?: IMBox[];
}
export declare class Image<Config extends ImageConfig = ImageConfig> extends Konva.Image {
    src: string;
    editor: Editor | null;
    boxes: Set<Box>;
    createBoxAction: CreateBoxAction | null;
    actionStore: ActionsStore;
    constructor(config: Config);
    init(config: Config): void;
    addImBox(imBox: IMBox): void;
    renderBoxes(): void;
    mouseDownAction(event: KonvaEventObject<MouseEvent>): Promise<void>;
    mouseMoveAction(event: KonvaEventObject<MouseEvent>): Promise<void>;
    mouseUpAction(event: KonvaEventObject<MouseEvent>): Promise<void>;
    mouseEnterAction(event: KonvaEventObject<MouseEvent>): void;
    mouseLeaveAction(event: KonvaEventObject<MouseEvent>): void;
}
