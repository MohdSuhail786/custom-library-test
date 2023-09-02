import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { Image } from "./Image";
import { Anchor, Box } from "./Box";
import { KonvaEventObject } from "konva/lib/Node";
import { AppMode, IMImage, EditorState, IMBox } from "./Types";
import { Rect } from "konva/lib/shapes/Rect";
export interface StageConfig extends Konva.StageConfig {
    spacingLeft?: number;
}
export declare class Editor<Config extends StageConfig = StageConfig> extends Konva.Stage {
    layer: Konva.Layer | null;
    images: Image[];
    activeImage: Image | null;
    _zoomStep: number;
    spacingLeft: number;
    appMode: AppMode;
    crosshairLines: [Konva.Line, Konva.Line];
    constructor(config: Config);
    importEditorState(editorState: EditorState): Promise<void>;
    exportEditorState(): EditorState;
    destructor(): void;
    init(config: Config): void;
    loadFirstImageIfRequired(): Promise<void>;
    keyDownAction: (event: KeyboardEvent) => Promise<void>;
    keyUpAction: (event: KeyboardEvent) => void;
    mouseMoveAction: (event: MouseEvent) => void;
    dragStartAction(event: KonvaEventObject<DragEvent>): void;
    dragEndAction(event: KonvaEventObject<DragEvent>): void;
    renderCrossHair(): void;
    addImage(imImage: IMImage, imBoxes?: IMBox[]): Promise<Image>;
    removeActiveImage(): void;
    loadImage(image: Image): Promise<void>;
    extractBBoxes(): {
        box: IMBox;
        label: string;
    }[];
    extractCutOuts(): {
        base64: string;
        label: string;
    }[];
    zoomInOutStage: (event: WheelEvent, position?: Vector2d, newPosition?: Vector2d) => void;
    scaleAnchors(): void;
    resetZoom(): void;
    fitToScreen(): void;
    syncActiveImage(image: Image): void;
    syncImageList(): void;
    getRelativeBBoxOfStage(): {
        l: number;
        r: number;
        t: number;
        b: number;
    };
    hideCrossHairs(): void;
    showCrossHairs(): void;
    setSelectionBoxesListening(listen: boolean, filter?: (box: Box) => boolean): void;
    updateCursorStyle(target?: Image | Box | Rect | Anchor | null): void;
    setMode(appMode: AppMode): void;
}
