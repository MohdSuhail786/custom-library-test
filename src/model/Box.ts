import Konva from "konva";
import { Image } from "./Image";
import { KonvaEventObject } from "konva/lib/Node";
import { Editor } from "./Editor";
import { Vector2d } from "konva/lib/types";
import { setRecoil } from "recoil-nexus";
import { appModeAtom } from "../state/editor";
import { BoxTransformAction } from "../actions/BoxTransformAction";
import ActionsStore from "../actions/ActionStore";
import { BoxMoveAction } from "../actions/BoxMoveAction";

export interface GroupConfig extends Konva.GroupConfig {
    image: Image,
    label?: string
}

export interface AnchorConfig extends Konva.RectConfig {
    box: Box
}


export class Anchor<Config extends AnchorConfig = AnchorConfig> extends Konva.Rect {
    box: Box | null = null
    constructor(config: Config) {
        super(config)
        this.box = config.box;
    }
}

export class Box<Config extends GroupConfig = GroupConfig> extends Konva.Group {

    rect: Konva.Rect = new Konva.Rect();
    label: string = '';
    image: Image | null = null;
    editor: Editor | null = null;
    anchors: {rect?: Konva.Rect, pos: [number,number], name: string}[] =  [{pos: [0,0], name: 'top-left'}, {pos: [1,0], name: "top-right"}, {pos: [0,1], name: 'bottom-left'}, {pos: [1,1], name: 'bottom-right'}]
    boxTransformAction: BoxTransformAction | null = null;
    boxMoveAction: BoxMoveAction | null = null;

    constructor(config: Config) {
        super(config)
        this.init(config);
        this.on("mousemove", this.mouseMoveAction.bind(this))
        this.on('click', this.mouseClickAction.bind(this))
        this.on('mouseenter', this.mouseEnterAction.bind(this))
        this.on('mouseleave', this.mouseLeaveAction.bind(this))
        this.on('dragstart', this.handleDragStart.bind(this))
        this.on('dragmove', this.handleDragMove.bind(this))
        this.on('dragend', this.handleDragEnd.bind(this))
    }

    init(config: Config) {
        this.image = config.image;
        this.editor = this.image.editor;
        this.label = config?.label || "";
        this.initAnchors()
        this.rect = new Konva.Rect({
            x: 0,
            y: 0,
            width: this.width(),
            height: this.height(),
            fill: 'rgb(66, 72, 255, 0.10)',
            stroke: 'rgb(66, 72, 255)',
            strokeWidth: 1.5,
            strokeScaleEnabled: false,
        })
        this.add(this.rect)
    }

    initAnchors() {
        this.anchors.forEach(anchor => {
            anchor.rect = new Anchor({
                x: anchor.pos[0] * this.width(),
                y: anchor.pos[1] * this.height(),
                width: 10,
                height: 10,
                name: anchor.name,
                draggable: true,
                stroke: 'black',
                strokeWidth: 1.5,
                strokeScaleEnabled: false,
                fill: 'white',
                visible: false,
                box: this
            })
            anchor.rect.on('mouseenter',this.handleAnchorMouseEnter.bind(this))
            anchor.rect.on('mouseleave',this.handleAnchorMouseLeave.bind(this))
            anchor.rect.on('dragmove',this.handleAnchorDragMove.bind(this))
            anchor.rect.on('dragstart',this.handleAnchorDragStart.bind(this))
            anchor.rect.on('dragend',this.handleAnchorDragEnd.bind(this))
            this.add(anchor.rect)
        })
    }

    handleDragStart(event: Konva.KonvaEventObject<DragEvent>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.boxMoveAction = new BoxMoveAction({box: this,actionsStore: this.image?.actionStore as ActionsStore})
            this.boxMoveAction.build().then(() => {
                resolve()
            }).catch((error) => {
                console.log(error)
            })
        })
    }

    handleDragMove(event: Konva.KonvaEventObject<DragEvent>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.boxMoveAction?.execute();
        })
    }

    handleDragEnd(event: Konva.KonvaEventObject<DragEvent>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.boxMoveAction?.finish().then(()=>{
                resolve()
            }).catch((error)=>{
                console.log(error)
            });
        })
    }

    updateAnchorsPosition() {
        this.anchors.forEach(anchor => {
            anchor.rect?.x(anchor.pos[0] * this.rect.width())
            anchor.rect?.y(anchor.pos[1] * this.rect.height())
        })
    }

    handleAnchorDragStart(event: Konva.KonvaEventObject<DragEvent>): Promise<void> {
        return new Promise((resolve, reject) => {
            event.cancelBubble = true;
            if(this.editor?.appMode.mode === "EDIT_MODE") {
                setRecoil(appModeAtom, (prev) => ({...prev, visible: false}));
            }
            this.hideAnchors();
            this.boxTransformAction = new BoxTransformAction({anchor: event.target as Anchor,box: this,actionsStore: this.image?.actionStore as ActionsStore})
            this.boxTransformAction.build().then(() => {
                resolve()
            }).catch((error) => {
                console.log(error)
            });
        })
    }

    handleAnchorDragEnd(event: Konva.KonvaEventObject<DragEvent>): Promise<void> {
        return new Promise((resolve, reject)=> {
            event.cancelBubble = true
            if(this.editor?.appMode.mode === "EDIT_MODE") {
                setRecoil(appModeAtom, (prev) => ({...prev, visible: true}));
                this.showAnchors();
                this.updateAnchorsPosition();
            } else {
                setTimeout(() => {
                    const target = this.editor?.getIntersection(this.editor?.getPointerPosition() as Vector2d);
                    target instanceof Box && target.showAnchors();
                    target instanceof Konva.Rect && (target.parent as unknown as Box).showAnchors();
                }, 50);
            }
            this.editor?.updateCursorStyle()
            this.boxTransformAction?.finish().then(()=>{
                resolve()
            }).catch(error => console.log(error))
        })
    }

    handleAnchorDragMove(event: Konva.KonvaEventObject<DragEvent>): Promise<void> {
        return new Promise((resolve, reject) => {
            event.cancelBubble = true
            this.boxTransformAction?.execute().then(() => {
                resolve();
            }).catch((error) => {
                console.log(error)
            })
        })
    }

    handleAnchorMouseLeave(event: Konva.KonvaEventObject<MouseEvent>) {
        event.cancelBubble = true
        this.editor?.updateCursorStyle()
    }

    handleAnchorMouseEnter(event: Konva.KonvaEventObject<MouseEvent>) {
        event.cancelBubble = true
        this.editor?.updateCursorStyle(event.target as Anchor)
    }

    showAnchors() {
        this.anchors.forEach(anchor => {
            anchor.rect?.show();
            this.updateAnchorsScale()
            this.updateAnchorsPosition();
            anchor.rect?.moveToTop();
        })
    }

    updateAnchorsScale() {
        const scale = this.editor?.scaleX() || 1;
        this.anchors.forEach(anchor => {
            anchor.rect?.width(10 / scale);
            anchor.rect?.height(10 / scale);
            anchor.rect?.offset({
                x: anchor.rect.width() / 2,
                y: anchor.rect.height() /2
            })
        })
    }

    hideAnchors() {
        this.anchors.forEach(anchor => anchor.rect?.hide())
    }

    mouseClickAction(event: KonvaEventObject<MouseEvent>) {
        console.log(this)
        if(this.editor?.appMode.mode === 'DRAG_SELECTION_MODE') {
            this.editor.setMode({
                mode: "EDIT_MODE",
                boxInEditMode: this,
                visible: true
            });
        }
    }

    mouseMoveAction(event: KonvaEventObject<MouseEvent>) {
    }
    
    mouseEnterAction(event: KonvaEventObject<MouseEvent>) {
        this.editor?.updateCursorStyle(this)
        this.showAnchors()
    }

    mouseLeaveAction(event: KonvaEventObject<MouseEvent>) {
        this.editor?.updateCursorStyle()
        if(this.editor?.appMode.mode === "EDIT_MODE") {
            this.showAnchors()
        } else {
            this.hideAnchors()
        }
    }

    updateLabel(label: string) {
        this.label = label;
    }

}