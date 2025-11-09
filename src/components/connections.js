import { css, LitElement, svg } from "lit";
import { repeat } from "lit/directives/repeat.js";

class RigatoniConnections extends LitElement {

    static properties = {
        connections: { attribute: false }
    }

    static styles = css`
        svg {
            position: absolute; 
            top: 0; 
            left: 0
        }

        :host {
            pointer-events: none;
        }
    `;

    constructor() {
        super();
        this.connections = [];
    }

    findNodeConnections(node) {
        return this.connections
            .filter(connection => connection.inputNode === node || connection.outputNode === node);
    }

    render() {
        return svg`
            <svg width="100%" height="100%">
                ${repeat(
                    this.connections,
                    (c) => {
                        const p1 = c.p1 || c.inputPoint;
                        const p2 = c.p2 || c.outputPoint;
                        return svg`<line x1=${p1.x} y1=${p1.y} x2=${p2.x} y2=${p2.y} style="stroke:#3B82F6;stroke-width:2"></line>`
                    }
                )}
            </svg>
        `
    }
}

customElements.define('rigatoni-connections', RigatoniConnections)