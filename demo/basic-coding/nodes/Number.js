import { RigatoniNode } from "../../../src/model/RigatoniNode";

export class Num extends RigatoniNode {

    static inputs = {
        num: { type: Number }
    }

    static outputs = {
        result: { type: Number }
    }

    onUpdate() {
        if (isNaN(this.num)) return false;

        this.result = this.num;
        return true;
    }
}