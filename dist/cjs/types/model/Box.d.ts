import Konva from "konva";
import { Image } from "./Image";
import { KonvaEventObject } from "konva/lib/Node";
import { Editor } from "./Editor";
import { BoxTransformAction } from "../actions/BoxTransformAction";
import { BoxMoveAction } from "../actions/BoxMoveAction";
export interface GroupConfig extends Konva.GroupConfig {
    image: Image;
    label?: string;
}
export interface AnchorConfig extends Konva.RectConfig {
    box: Box;
}
export declare class Anchor<Config extends AnchorConfig = AnchorConfig> extends Konva.Rect {
    box: Box | null;
    constructor(config: Config);
}
export declare class Box<Config extends GroupConfig = GroupConfig> extends Konva.Group {
    rect: Konva.Rect;
    label: string;
    image: Image | null;
    editor: Editor | null;
    anchors: {
        rect?: Konva.Rect;
        pos: [number, number];
        name: string;
    }[];
    boxTransformAction: BoxTransformAction | null;
    boxMoveAction: BoxMoveAction | null;
    constructor(config: Config);
    init(config: Config): void;
    initAnchors(): void;
    handleDragStart(event: Konva.KonvaEventObject<DragEvent>): Promise<void>;
    handleDragMove(event: Konva.KonvaEventObject<DragEvent>): Promise<void>;
    handleDragEnd(event: Konva.KonvaEventObject<DragEvent>): Promise<void>;
    updateAnchorsPosition(): void;
    handleAnchorDragStart(event: Konva.KonvaEventObject<DragEvent>): Promise<void>;
    handleAnchorDragEnd(event: Konva.KonvaEventObject<DragEvent>): Promise<void>;
    handleAnchorDragMove(event: Konva.KonvaEventObject<DragEvent>): Promise<void>;
    handleAnchorMouseLeave(event: Konva.KonvaEventObject<MouseEvent>): void;
    handleAnchorMouseEnter(event: Konva.KonvaEventObject<MouseEvent>): void;
    showAnchors(): void;
    updateAnchorsScale(): void;
    hideAnchors(): void;
    mouseClickAction(event: KonvaEventObject<MouseEvent>): void;
    mouseMoveAction(event: KonvaEventObject<MouseEvent>): void;
    mouseEnterAction(event: KonvaEventObject<MouseEvent>): void;
    mouseLeaveAction(event: KonvaEventObject<MouseEvent>): void;
    updateLabel(label: string): void;
}
