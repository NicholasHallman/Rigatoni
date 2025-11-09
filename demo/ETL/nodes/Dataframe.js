import { RigatoniNode } from "../../../src/model/RigatoniNode";


export class Dataframe extends RigatoniNode {

    static inputs = {
        dataframe: { type: String }
    }

    static outputs = {
        output: { type: Object }
    }

    onUpdate() {
        const rawArray = JSON.parse(this.dataframe);
        const frame = {
            data: {}
        };

        const [inputColumns, ...rows] = rawArray;

        inputColumns.forEach(columnName => {
            frame.data[columnName] = [];
        });

        rows.forEach((row) => {
            row.forEach((v, i) => {
                const colmnName = inputColumns[i];
                frame.data[colmnName].push(v);
            })
        });

        this.output = frame;
        return true;
    }
}