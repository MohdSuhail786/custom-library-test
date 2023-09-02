import { Vector2d } from "konva/lib/types";
import { Anchor, Box } from "../model/Box";
import { IMBox } from "../model/Types";
import { Action } from "./AbstractAction";
import ActionsStore from "./ActionStore";

interface BoxTransformActionIProps {
    parent?: Action<any>;
    actionsStore: ActionsStore
    box: Box
    anchor: Anchor
}

export class BoxTransformAction extends Action<Box> {

    anchor: Anchor | null = null;
    oldPosition: IMBox | null = null;
    newPosition: IMBox | null = null;

    constructor(config: BoxTransformActionIProps) {
        super(config.box, config.actionsStore, config.parent)
        this.anchor = config.anchor;
    }

    build(): Promise<void> {
        return new Promise((resolve,reject) => {
            if(this.status !== "awaitingBuild") {
                this.status = 'buildFailed';
                return reject("Unable to store old position of box.");
            }
            this.oldPosition = {
                x: this.subject.x(),
                y: this.subject.y(),
                width: this.subject.rect.width(),
                height: this.subject.rect.height(),
                label: ""
            }
            this.status = 'awaitingExecute';
            resolve();
        })
    }

    execute(): Promise<void> {
        return new Promise((resolve,reject) => {
            if(!['awaitingExecute','executing'].includes(this.status)) {
                this.status = 'executionFailed';
                return reject("Unable to transform box.");
            }

            const pos = this.subject.image?.editor?.getRelativePointerPosition() as Vector2d;
            switch(this.anchor?.name()) {
                case 'top-left': 
                    this.subject.rect.width(this.subject.rect.width() + this.subject.x() - pos.x)
                    this.subject.rect.height(this.subject.rect.height() + this.subject.y() - pos.y)
                    this.subject.y(pos.y);
                    this.subject.x(pos.x)
                    break;
                case 'bottom-right': 
                    this.subject.rect.width(pos.x - this.subject.x())
                    this.subject.rect.height(pos.y - this.subject.y())
                    break;
                case 'top-right': 
                    this.subject.rect.height(this.subject.rect.height() - (pos.y - this.subject.y()))
                    this.subject.rect.width(pos.x - this.subject.x())
                    this.subject.y(pos.y);
                    break;
                case 'bottom-left':
                    this.subject.rect.width(this.subject.rect.width() + this.subject.x() - pos.x)
                    this.subject.rect.height(this.subject.rect.height() + (pos.y - (this.subject.y() + this.subject.rect.height())))
                    this.subject.x(pos.x)
                    break;
            }
            this.newPosition = {
                x: this.subject.x(),
                y: this.subject.y(),
                width: this.subject.rect.width(),
                height: this.subject.rect.height(),
                label: ""
            }
            this.status = 'executing'
            resolve()
        })
    }

    undo(): Promise<void> {
        return new Promise((resolve,reject) => {
            if(this.status !== 'finish' || !this.oldPosition) {
                this.status = 'undoFailed';
                return reject("Unable to undo, action execution is not finished yet or old position is not found.");
            }

            this.subject.x(this.oldPosition.x);
            this.subject.y(this.oldPosition.y);
            this.subject.rect.width(this.oldPosition.width);
            this.subject.rect.height(this.oldPosition.height);
            this.subject.updateAnchorsPosition();
            this.status = 'undo'
            resolve()
        })
    }

    redo(): Promise<void> {
        return new Promise((resolve,reject) => {
            if(this.status !== "undo" || !this.newPosition) {
                this.status = 'redoFailed';
                return reject("Unable to redo. Undo is not finished yet or new position is not found.")
            }

            this.subject.x(this.newPosition.x);
            this.subject.y(this.newPosition.y);
            this.subject.rect.width(this.newPosition.width);
            this.subject.rect.height(this.newPosition.height);
            this.subject.updateAnchorsPosition();

            this.status = 'finish'
            resolve();
        })
    }

}