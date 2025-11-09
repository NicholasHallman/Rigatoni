import { RigatoniNode } from "../../../src/model/RigatoniNode";



export class Subtract extends RigatoniNode {

    static inputs = {
        a: { type: Number },
        b: { type: Number }
    }

    static outputs = {
        result: { type: Number }
    }

    onUpdate() {
        if (isNaN(this.a) || isNaN(this.b)) return false;

        this.result = this.a - this.b;
        return true;
    }
}