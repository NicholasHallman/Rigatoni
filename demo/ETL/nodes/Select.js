import { RigatoniNode } from "../../../src/model/RigatoniNode";


export class Select extends RigatoniNode {


    static inputs = {
        dataframe: { type: Object },
        columns: { type: String }
    }

    static outputs = {
        result: { type: Object }
    }

    onUpdate() {
        const splitColumns = this.columns.split(',').map(colm => colm.trim());

        const frame = {
            data: {}
        }

        splitColumns.forEach(column => {
            if (column in this.dataframe.data) {
                frame.data[column] = this.dataframe.data[column];
            }
        })

        this.result = frame;
        return true;
    }

}