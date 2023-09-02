import { Vector2d } from "konva/lib/types";
import { Box } from "../model/Box";
import { Action } from "./AbstractAction";
import ActionsStore from "./ActionStore";

interface BoxMoveActionIProps {
    parent?: Action<any>;
    actionsStore: ActionsStore,
    box: Box
}

export class BoxMoveAction extends Action<Box> {

    oldPosition: Vector2d | null = null;
    newPosition: Vector2d | null = null;

    constructor(config: BoxMoveActionIProps) {
        super(config.box, config.actionsStore, config.parent)
    }

    build(): Promise<void> {
        return new Promise((resolve,reject) => {
            if(this.status !== "awaitingBuild") {
                this.status = 'buildFailed';
                return reject("Unable to save old position of box.");
            }

            this.oldPosition = {
                x: this.subject.x(),
                y: this.subject.y()
            }

            this.status = 'awaitingExecute';
            resolve();
        })
    }

    execute(): Promise<void> {
        return new Promise((resolve,reject) => {
            if(!['awaitingExecute','executing'].includes(this.status)) {
                this.status = 'executionFailed';
                return reject("Unable to move box.");
            }
            this.newPosition = {
                x: this.subject.x(),
                y: this.subject.y()
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

            this.subject.x(this.oldPosition.x)
            this.subject.y(this.oldPosition.y)

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

            this.subject.x(this.newPosition.x)
            this.subject.y(this.newPosition.y)

            this.status = 'finish'
            resolve();
        })
    }

}