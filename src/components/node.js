import { css, html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat.js";

import './icons.js';
import './button.js';

export class RigatoniVisualNode extends LitElement {

    static properties = {
        x: { type: Number },
        y: { type: Number },
        type: { type: Object },
        dragging: { type: Boolean, reflect: true }
    }

    static styles = css`
        :host {
            cursor: grab;
            background-color: white;
            position: absolute;
            display: inline-block;
            box-shadow: 0px 0px 10px #ababab;
            border-radius: 8px;
            padding: 10px;
            user-select: none;
            font-family: "Inter", sans-serif;
            font-optical-sizing: auto;
            font-style: normal;
            color: #1C1E21;
        }

        h3 {
            color: white;
        }

        :host([dragging]) div {
            cursor: grabbing;
        }

        .bubble {
            cursor: pointer;
            width: 10px;
            height: 10px;
            background-color: white;
            border: solid 1px #3B82F6;
            border-radius: 5px;
        }

        .bubble.connected {
            background-color: #3B82F6;
        }

        .input {
            margin-left: 10px;
            margin-right: 10px;
        }

        .output {
            margin-right: 10px;
        }

        .inline {
            display: flex;
            align-items: center;
        }

        .inline.end {
            justify-content: flex-end;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            margin: 0;
            margin-top: -10px;
            margin-left: -10px;
            padding: 0px 10px 0px 10px;
            background-color: #2E5BFF;
            width: 100%;
            border-radius: 8px 8px 0px 0px;
        }
    `;

    constructor() {
        super();
        this.x = 0;
        this.y = 0;
    }


    connectedCallback() {
        super.connectedCallback();
        this.type.addHost(this);
        this.addEventListener('mousedown', this.#handleMouseDown);
    }

    render() {
        this.setAttribute('style', `top: ${this.y}; left: ${this.x}`);
        return html`
            <div class="header">
                <h3>${this.type.name}</h3>
                <rigatoni-button @click=${this.#handleDelete}><rigatoni-icons icon="cross"></rigatoni-icons></rigatoni-button>
            </div>
            ${this.#renderInputs()}
            ${this.#renderOutputs()}
        `
    }

    #renderInputs() {
        const kvInputs = Object.entries(this.type.inputs);
        return repeat(
            kvInputs,
            ([k]) => k,
            ([k, v]) => {
                let value = this.type[k];
                const vType = this.type.constructor.inputs[k].type;
                if (vType === Object) value = JSON.stringify(value);
                return html`
                <div class="inline">
                    <div 
                        class="bubble ${v.__connectedTo ? 'connected' : ''}" 
                        connection-name="input-${k}"
                        @mouseup=${this.#handleConnectionEnd}
                    ></div>
                    <p class="input">${k}</p>
                    <input 
                        @input=${this.#handleInputChange} 
                        name=${`input-${k}`} 
                        type="text" 
                        .value=${this.type[k] === undefined ? '' : value}>
                    </input>
                </div>
                `
            }
        );
    }

    #handleDelete(e) {
        console.log(e);
    }

    #handleMouseDown(e) {
        let bubble = e.composedPath().find(elm => [...(elm.classList ?? [])].includes('bubble'));
        if (bubble){
            this.#handleConnectionStart(e, bubble);
        } else {
            this.#handleDragStart(e);
        }
    }

    #handleDragStart(e) {
        this.startMouseXPosition = e.clientX;
        this.startMouseYPosition = e.clientY;
        this.startX = this.x;
        this.startY = this.y;
        this.dispatchEvent(new CustomEvent('dragstart', {
            detail: this
        }))
    }

    #renderOutputs() {
        if (!this.type.outputs) return;
        const kvOutputs = Object.entries(this.type.outputs);
        return repeat(
            kvOutputs,
            ([k]) => k,
            ([k, v]) => html`
                <div class="inline end">
                    <p class="output">${k}</p>
                    <div class="bubble ${v.__connectedTo ? 'connected' : ''}" 
                        connection-name="output-${k}"
                        @mouseup=${this.#handleConnectionEnd}
                    ></div>
                </div>`
        );
    }

    #handleInputChange(e) {
        const inputName = e.currentTarget.getAttribute('name').replace('input-', '');
        this.dispatchEvent(new CustomEvent('inputchange', {
            detail: {
                inputName,
                value: e.currentTarget.value
            }
        }))
    }

    #handleConnectionStart(e, bubble) {
        const connectionName = bubble.getAttribute('connection-name');
        const isInput = connectionName.startsWith('input');

        const nodes = {};
        if (isInput) {
            nodes.input = {
                connectionName: connectionName.replace('input-', ''),
                node: this
            }
        } else {
            nodes.output = {
                connectionName: connectionName.replace('output-', ''),
                node: this
            }
        }
        this.dispatchEvent(new CustomEvent('connectionstart', {
            detail: {
                nodes,
                x: e.clientX,
                y: e.clientY
            }
        }))
    }

    #handleConnectionEnd(e) {
        const connectionName = e.target.getAttribute('connection-name');
        const isInput = connectionName.startsWith('input');
        this.dispatchEvent(new CustomEvent('connectionend', {
            detail: {
                connectionName: isInput ? connectionName.replace('input-', '') : connectionName.replace('output-', ''),
                isInput,
                node: this
            }
        }));
    }
}

customElements.define('rigatoni-node', RigatoniVisualNode)