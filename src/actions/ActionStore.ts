import { Action } from "./AbstractAction";

class ActionsStore {
    ActionsList: Action<any>[] = [];
    index: number = -1;
    maxLength: number = 10;

    constructor() {
    }

    push(action: Action<any>) {
        this.index += 1;
        this.ActionsList[this.index] = action
        if (this.ActionsList.length > this.maxLength) {
            this.ActionsList.shift();
            this.index -= 1;
        }
    }

    undo(): Promise<void> {
        return new Promise((resolve,reject) => {
            if (this.index === -1) return reject("No more action to undo.");
                this.ActionsList[this.index].undo().then(() => {
                    this.index -= 1;
                    resolve();
                })
        })
    }

    redo(): Promise<void> {
        return new Promise((resolve,reject) => {
            if (this.ActionsList.length === this.index +1) return reject("No more action to redo.");
                this.ActionsList[this.index + 1].redo().then(() => {
                    this.index += 1;
                    resolve()
                })
        })
    }

}

export default ActionsStore