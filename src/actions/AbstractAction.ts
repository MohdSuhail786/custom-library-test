import { Image } from "../model/Image";
import { uuidv4 } from "../utils/utils";
import ActionsStore from "./ActionStore";

export abstract class Action<T> {
    childActions: Action<any>[] = [];
    parentAction?: Action<any> | null = null;
    image: Image | null = null;
    subject: T;
    status: 'finish' | 'awaitingExecute' | 'awaitingBuild' | 'executing' | 'undo' | 'buildFailed' | 'executionFailed' | 'undoFailed' | 'redoFailed';
    actionID: string;
    actionStore: ActionsStore | null = null

    constructor(subject: any, actionStore: ActionsStore, parent?: Action<any>) {
        this.actionID = uuidv4()
        this.childActions = [];
        this.subject = subject;
        this.actionStore = actionStore
        if (parent) {
            this.parentAction = parent;
            this.parentAction.childActions.push(this)
        }
        else this.actionStore.push(this)
        this.status = 'awaitingBuild'
    }

    abstract build(config?: any): Promise<any>

    abstract execute(config?: any): Promise<any>

    finish(config?: any): Promise<void> {
        return new Promise((resolve,reject) => {
            this.status = 'finish';
            resolve();
        })
    }

    abstract undo(): Promise<any>

    abstract redo(): Promise<any>

    directExecute(): Promise<Action<T>> {
        return new Promise((resolve,reject) => {
            this.build().then(() => {
                this.execute().then(() => {
                    this.finish().then(() => {
                        resolve(this)
                    })
                })
            })
        })
    }

    destroy(): Promise<void> {
        return new Promise((resolve,reject) => {
            if (this?.parentAction?.childActions)
                this.parentAction.childActions = this.parentAction.childActions.filter(action => action.actionID === this.actionID)
            else {
                if(!this.image) return;
                this.image.actionStore.index -= 1;
                this.image.actionStore.ActionsList.pop()
            }
            resolve();
        })
    }

}