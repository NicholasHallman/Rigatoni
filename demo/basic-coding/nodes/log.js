import { RigatoniNode } from "../../../src/model/RigatoniNode";



export class ConsoleLog extends RigatoniNode {
    static inputs = {
        in: { type: Object }
    }

    onUpdate() {
        // triggers when an input changes
        console.log(this.in);
        return true;
    }
}