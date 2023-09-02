import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Editor } from "./Editor";
import { Vector2d } from "konva/lib/types";
import { Box } from "./Box";
import { CreateBoxAction } from "../actions/CreateBoxAction";
import { IMBox } from "./Types";
import ActionsStore from "../actions/ActionStore";

export interface ImageConfig extends Konva.ImageConfig {
    editor: Editor
    src: string
    imBoxes?: IMBox[]
}

export class Image<Config extends ImageConfig = ImageConfig> extends Konva.Image {

    src: string = "";
    editor: Editor | null = null;
    boxes: Set<Box> = new Set();
    createBoxAction: CreateBoxAction | null = null;
    actionStore: ActionsStore = new ActionsStore();


    constructor(config: Config) {
        super(config);
        
        this.init(config)

        this.on("mousedown", this.mouseDownAction.bind(this));
        this.on("mousemove", this.mouseMoveAction.bind(this));
        this.on("mouseup", this.mouseUpAction.bind(this));
        this.on('mouseenter', this.mouseEnterAction.bind(this))
        this.on('mouseleave', this.mouseLeaveAction.bind(this))
        
        this.cache()    
    }

    init(config: Config) {
        this.src = config.src
        this.editor = config.editor;
        if(config.imBoxes) {
            config.imBoxes.forEach(imBox => this.addImBox(imBox))
        }
    }

    addImBox(imBox: IMBox) {
        const box = new Box({
            ...imBox,
            draggable: true,
            listening: false,
            image: this,
        })
        this.boxes.add(box);
    }

    renderBoxes() {
        [...this.boxes].forEach(box => {
            this.editor?.layer?.add(box);
            box.moveToTop()
        })
    }

    async mouseDownAction(event: KonvaEventObject<MouseEvent>) {
        try {
            if(this.editor?.appMode.mode !== "DRAWING_MODE" || this.createBoxAction !== null || event.evt.which !== 1) return;
            this.editor?.hideCrossHairs()
            const pos = this.editor?.getRelativePointerPosition() as Vector2d;
            this.createBoxAction = new CreateBoxAction({pos,image:this, actionsStore: this.actionStore})
            await this.createBoxAction.build()
        } catch (error) {
            console.log(error)
        }
    }

    async mouseMoveAction(event: KonvaEventObject<MouseEvent>) {
        try {
            if(this.editor?.appMode.mode !== "DRAWING_MODE" || this.createBoxAction === null) return;
            const pos = this.editor?.getRelativePointerPosition() as Vector2d;
            await this.createBoxAction.execute(pos);
        } catch (error) {
            console.log(error)
        }
    }

    async mouseUpAction(event: KonvaEventObject<MouseEvent>) {
        try {
            if(this.editor?.appMode.mode !== "DRAWING_MODE" || this.createBoxAction === null) return;
            this.editor?.showCrossHairs()
            await this.createBoxAction.finish();
            if(this.createBoxAction.subject?.rect?.width() === 0 || this.createBoxAction.subject?.rect?.height() === 0) {
                await this.createBoxAction.undo();
                await this.createBoxAction.destroy()
                this.createBoxAction = null;
                return;
            }
            this.editor?.setMode({
                mode: "EDIT_MODE",
                boxInEditMode: this.createBoxAction.subject,
                visible: true
            })
            this.createBoxAction = null;
        } catch (error) {
            console.log(error)
        }
    }

    mouseEnterAction(event: KonvaEventObject<MouseEvent>) {
        this.editor?.updateCursorStyle(this)
    }

    mouseLeaveAction(event: KonvaEventObject<MouseEvent>) {
        this.editor?.updateCursorStyle()
    }
}