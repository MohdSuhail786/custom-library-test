import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { Image } from "./Image";
import { Anchor, Box } from "./Box";
import { setRecoil } from "recoil-nexus";
import { activeImageAtom, appModeAtom, imageListAtom, loaderAtom } from "../state/editor";
import { KonvaEventObject } from "konva/lib/Node";
import { AppMode, IMImage, EditorState, IMBox, IMState } from "./Types";
import { RemoveBoxAction } from "../actions/RemoveBoxAction";
import ActionsStore from "../actions/ActionStore";
import { Rect } from "konva/lib/shapes/Rect";

export interface StageConfig extends Konva.StageConfig {
    spacingLeft?: number
}

export class Editor<Config extends StageConfig = StageConfig> extends Konva.Stage {
    layer: Konva.Layer | null = null;
    images: Image[] = []
    activeImage: Image | null = null;
    _zoomStep: number = 1.1;
    spacingLeft: number = 0;
    appMode: AppMode = {
        mode: "DRAWING_MODE"
    };
    crosshairLines: [Konva.Line, Konva.Line] = [new Konva.Line(), new Konva.Line()];

    constructor(config: Config) {
        super(config);
        this.init(config);
        this.container().addEventListener("wheel", this.zoomInOutStage);
        document.addEventListener("keydown", this.keyDownAction)
        document.addEventListener("keyup", this.keyUpAction)
        document.addEventListener("mousemove", this.mouseMoveAction)
        this.on("dragstart", this.dragStartAction.bind(this))
        this.on("dragend", this.dragEndAction.bind(this))
        this.on("click", () => {
            console.log(this.getRelativePointerPosition())
        })
    }

    importEditorState(editorState: EditorState): Promise<void> {
        return new Promise((resolve,reject) => {
            setRecoil(loaderAtom, {visible: true, title: "Importing image..."})
            Promise.all(editorState.map(imState => this.addImage(imState.image, imState.boxes)))
            .then(() =>{
                this.syncImageList();
                this.loadFirstImageIfRequired()
                resolve()
            }).catch((err) => console.log(err)).finally(() => {
                setRecoil(loaderAtom, {visible: false})
            })
        })
    }

    exportEditorState(): EditorState {
        return this.images.map(image => ({
            image: {
                id: image.id(),
                src: image.src,
                name: image.name()
            },
            boxes: [...image.boxes].map(box => {
                const pos = box.getClientRect();
                return ({
                    x: box.x(),
                    y: box.y(),
                    width: box.rect?.width(),
                    height: box.rect?.height(),
                    label: box?.label || ""
                }) as IMBox
            })
        }) as IMState)
    }

    destructor() {
        this.container().removeEventListener("wheel", this.zoomInOutStage);
        document.removeEventListener("keydown", this.keyDownAction)
        document.removeEventListener("keyup", this.keyUpAction)
        document.removeEventListener("mousemove", this.mouseMoveAction)
    }

    init(config: Config) {
        this.spacingLeft = config?.spacingLeft || 0;
        this.layer = new Konva.Layer();
        this.crosshairLines = [new Konva.Line({
            points: [0, 100, 1000, 100],
            stroke: '#424242',
            strokeWidth: 2,
            dash: [10, 5], 
            listening: false,
            strokeScaleEnabled: false,
            visible: false
        }),new Konva.Line({
            points: [0, 0, 0, this.height()],
            stroke: '#424242',
            strokeWidth: 2,
            dash: [10, 5],
            listening: false,
            strokeScaleEnabled: false,
            visible: false
        })]
        this.layer.add(this.crosshairLines[0],this.crosshairLines[1])
        this.add(this.layer);
        this.loadFirstImageIfRequired()
    }

    loadFirstImageIfRequired(): Promise<void> {
        return new Promise((resolve, reject) => {
            if(!this.activeImage && this.images.length) {
                this.loadImage(this.images[0]).then(()=>{
                    this.images[0].renderBoxes()
                    resolve()
                })
            }
        })
    }

    keyDownAction = async(event: KeyboardEvent) => {
        try {
            if(this.appMode.mode === 'EDIT_MODE') {
                if(event.key === 'Delete') {
                    await new RemoveBoxAction({box: this.appMode.boxInEditMode, actionsStore: this.appMode.boxInEditMode.image?.actionStore as ActionsStore}).directExecute();
                    this.setMode({
                        mode: "DRAWING_MODE"
                    })
                }
            }
            if(event.ctrlKey) {
                if(this.appMode.mode !== 'EDIT_MODE') {
                    this.setMode({
                        mode: "DRAG_SELECTION_MODE"
                    });
                    setTimeout(() => {
                        const target = this.getIntersection(this.getPointerPosition() as Vector2d);
                        target instanceof Box && target.showAnchors();
                        target instanceof Rect && (target.parent as unknown as Box).showAnchors();
                    }, 50);
                }
                if(event.key === 'z' || event.key === 'Z') {
                    await this.activeImage?.actionStore.undo()
                }
                if(event.key === 'y' || event.key === 'Y') {
                    await this.activeImage?.actionStore.redo()
                }
            }
        } catch (error) {
            console.log(error)                
        }
    }

    keyUpAction = (event: KeyboardEvent) => {
        if(!event.ctrlKey) {
            if(this.appMode.mode !== 'EDIT_MODE') 
                this.setMode({
                    mode: "DRAWING_MODE"
                })
        }
    }

    mouseMoveAction = (event: MouseEvent) => {
       this.setPointersPositions(event);
       this.renderCrossHair();
    }

    dragStartAction(event: KonvaEventObject<DragEvent>) {
        this.updateCursorStyle(null)
    }

    dragEndAction(event: KonvaEventObject<DragEvent>) {
        this.updateCursorStyle(null)
    }

    renderCrossHair() {
        const bBox = this.getRelativeBBoxOfStage();        
        const {x,y} = this.getRelativePointerPosition() as Vector2d
        this.crosshairLines[0].points([bBox.l, y, bBox.r, y]);
        this.crosshairLines[1].points([x, bBox.t, x, bBox.b]);

        this.crosshairLines[0].moveToTop()
        this.crosshairLines[1].moveToTop()
        this.layer?.batchDraw()
    }

    addImage(imImage: IMImage, imBoxes?: IMBox[]): Promise<Image> {
        return new Promise((resolve,reject) => {
            let pos:Vector2d = { x:0, y:0 };
            // if(this.activeImage) {
            //     const padding = 100;
            //     pos = {
            //         x: this.activeImage.x() + this.activeImage.width() + padding,
            //         y: 0
            //     }
            // }

            const image = new window.Image();
            image.crossOrigin = 'Anonymous';
            image.src = imImage.src;
            image.onload = (e) => {
                const img = new Image({
                    id: imImage.id,
                    name: imImage.name,
                    src: imImage.src,
                    x: pos.x,
                    y: pos.y,
                    fill: 'white',
                    draggable: false,
                    image: image,
                    editor: this,
                    imBoxes
                });
                this.images.unshift(img);
                resolve(img);
            }
            image.onerror = reject;
        })
    }

    removeActiveImage() {
        this.activeImage?.remove();
        this.activeImage = null;
    }

    loadImage(image: Image): Promise<void> {
        return new Promise((resolve, reject) => {
            setRecoil(loaderAtom, {visible: true, title: "Loading Image..."})
            this.syncActiveImage(image)
            if(this.activeImage) {
                this.removeActiveImage()
            }
            this.activeImage = image;
            this.layer?.add(image);
            this.fitToScreen();
            image.renderBoxes()
            this.showCrossHairs(); 
            setRecoil(loaderAtom, {visible: false})
        })
    }

    extractBBoxes(): {box: IMBox, label: string}[] {
        const [pos,scale] = [this.position(), this.scale()]
        this.resetZoom();
        const allSelectionBoxes = this.images.reduce((acc: Box[], curr: Image) => {
            return [...acc, ...curr.boxes]
        }, [] as Box[])
        const bBoxesWithLabels = [...allSelectionBoxes].filter(box => box.label !== "").map(box => ({
            box: {
                x: box.x(),
                y: box.y(),
                width: box.rect.width(),
                height: box.rect.height()
            } as IMBox,
            label: box.label
        }))
        this.position(pos)
        this.scale(scale)
        return bBoxesWithLabels;
    }

    extractCutOuts(): {base64: string, label: string}[] {
        const [pos,scale] = [this.position(), this.scale()]
        this.resetZoom();
        const allSelectionBoxes = this.images.reduce((acc: Box[], curr: Image) => {
            return [...acc, ...curr.boxes]
        }, [] as Box[])
        const cutOutsBase64 = [...allSelectionBoxes].filter(box => box.label !== "").map(box => {
            const pos = box?.rect?.getClientRect();
            return {
                base64: box?.image?.toDataURL({
                    x: pos.x,
                    y: pos.y,
                    width: pos.width,
                    height: pos.height
                }) || "",
                label: box.label
            }
        })
        this.position(pos)
        this.scale(scale)
        return cutOutsBase64;
    }

    zoomInOutStage = (event: WheelEvent, position: Vector2d = this.getPointerPosition() as Vector2d, newPosition?: Vector2d) => {
        event.preventDefault();
        if(this.appMode.mode === 'EDIT_MODE') return;
        if (event.ctrlKey) {
            const oldScale = this.scaleX();
            const mousePointTo = {
                x: position.x / oldScale - this.x() / oldScale,
                y: position.y / oldScale - this.y() / oldScale
            };

            const newScale = event.deltaY <= 0 ? oldScale * this._zoomStep : oldScale / this._zoomStep;
            this.scale({ x: newScale, y: newScale });
            this.scaleAnchors()
            const updatedPosition = newPosition || this.getPointerPosition() as Vector2d;

            const newPos = {
                x: -(mousePointTo.x - updatedPosition.x / newScale) * newScale,
                y: -(mousePointTo.y - updatedPosition.y / newScale) * newScale
            };
            this.position(newPos);
        } else if (event.shiftKey) {
            let moveByX = this.scaleY() * event.deltaY;
            let moveByY = this.scaleX() * event.deltaX;
            this.y(this.y() - moveByY);
            this.x(this.x() - moveByX);
        } else {
            let moveByY = this.scaleY() * event.deltaY;
            let moveByX = this.scaleX() * event.deltaX;
            this.y(this.y() - moveByY);
            this.x(this.x() - moveByX);
        }
        this.renderCrossHair()
    }

    scaleAnchors() {
        this.activeImage?.boxes.forEach(box => {
            box.updateAnchorsScale()
        })
    }

    resetZoom() {
        this.scale({ x: 1, y: 1 });
        this.position({ x: 0, y: 0 });
    }

    fitToScreen() {
        if(!this.activeImage) return;
        const paddingLeftRight = 2000;
        const paddingTopBottom = 100;
        const additionalPaddingLeft = this.spacingLeft;
        const additionalPaddingTop = 55;
        const newScale = Math.min((this.width() - additionalPaddingLeft)/((this.activeImage.x() + this.activeImage.width()) + paddingLeftRight), (this.height() - additionalPaddingTop)/((this.activeImage.y() + this.activeImage.height()) + paddingTopBottom))

        this.setAttrs({
            x: this.width() / 2 - ((this.activeImage.x() + this.activeImage.width()) / 2 * newScale) + additionalPaddingLeft / 2,
            y: this.height() / 2 - ((this.activeImage.y() + this.activeImage.height()) / 2 * newScale) + additionalPaddingTop / 2,
            scaleX: newScale,
            scaleY: newScale
        })
        this.scaleAnchors()
    }

    syncActiveImage(image: Image) {
        setRecoil(activeImageAtom, image)
    }

    syncImageList() {
        setRecoil(imageListAtom,[...this.images])
    }

    getRelativeBBoxOfStage() {
        const scale = this.scale() as Vector2d;
        return {
            l: -this.x() / scale.x,
            r: (this.width() - this.x()) / scale.x,
            t: -this.y() / scale.y,
            b: (this.height() - this.y()) / scale.y
        }
    }

    hideCrossHairs() {
        this.crosshairLines.forEach(line => line.hide())
    }

    showCrossHairs() {
        this.crosshairLines.forEach(line => line.show())
    }

    setSelectionBoxesListening(listen: boolean, filter: (box: Box) => boolean = () => true) {
        this.activeImage?.boxes.forEach(box => (filter(box)) ? box.listening(listen) : null)
    }

    updateCursorStyle(target?: Image | Box | Rect | Anchor | null) {
        if(!target) {
            target = this.getIntersection(this.getPointerPosition() as Vector2d) as unknown as (Image | Box | Rect | Anchor | null)
        }
        let cursor = 'default';
        if(this.appMode.mode === "DRAG_SELECTION_MODE") {
            if(target instanceof Anchor) {
                ['top-left', 'bottom-right'].includes(target.name()) ? cursor = 'nwse-resize' : cursor = 'nesw-resize';
            } else if(target instanceof Box || target instanceof Rect) {
                cursor = 'move';
            } else if(target instanceof Image || target === null) {
                if(this.isDragging()) {
                    cursor = 'grabbing'
                } else {
                    cursor = 'grab';
                }
            }
        } else if(this.appMode.mode === "EDIT_MODE") {
            if(target instanceof Anchor) {
                ['top-left', 'bottom-right'].includes(target.name()) ? cursor = 'nwse-resize' : cursor = 'nesw-resize'
            } else if(target instanceof Box  || target instanceof Rect) {
                cursor = 'move'
            } else {
                cursor = 'default'
            }
        } else if(this.appMode.mode === "DRAWING_MODE") {
            if(!target) {
                cursor = 'default'
            } else {
                cursor = 'crosshair'
            }
        }
        this.container().style.cursor = cursor;
    }

    setMode(appMode: AppMode) {
        if(appMode.mode === 'DRAG_SELECTION_MODE') {
            this.setSelectionBoxesListening(true);
            this.hideCrossHairs();
            this.draggable(true);
        } else if(appMode.mode === 'EDIT_MODE') {
            this.hideCrossHairs();
            this.setSelectionBoxesListening(false);
            appMode.boxInEditMode.showAnchors()
            appMode.boxInEditMode.listening(true);
            this.draggable(false);
        } else if(appMode.mode === 'DRAWING_MODE') {
            this.draggable(false);
            this.showCrossHairs();
            this.activeImage?.boxes.forEach(box => box.hideAnchors())
            this.setSelectionBoxesListening(false);
        }

        this.appMode = appMode;
        setRecoil(appModeAtom,appMode);
        setTimeout(() => {
            this.updateCursorStyle()
        }, 50);
    }
}