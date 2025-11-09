import { html, nothing } from "lit";
import { RigatoniNode } from "../../../src/model/RigatoniNode";


export class TableView extends RigatoniNode {

    static inputs = {
        dataframe: { type: Object, view: function() {

            if (this.dataframe === undefined) {
                return nothing;
            }

            const columns = Object.keys(this.dataframe.data);
            const rows = new Array(this.dataframe.data[columns[0]].length).fill(0).map(() => []);

            Object.values(this.dataframe.data).forEach(column => {
                column.forEach((value, i) => rows[i].push(value));
            });
            
            return html`
                <table style="border: solid 1px #C3C8D1; margin-top: 10px">
                    <tr>
                        ${columns.map(c => html`<th>${c}</th>`)}
                    </tr>
                    ${rows.map(r => html`
                        <tr style="background-color: #D3D8E1;">
                            ${r.map(v => html`<td>${v}</td>`)}
                        </tr>`)}
                </table>
            `;
        }}
    }

    static outputs = {
        result: { type: Object }
    }

    onUpdate() {
        this.result = this.dataframe;
        return true;
    }
}