import { css, html, LitElement, nothing, svg } from "lit";
import { RigatoniVisualNode } from "./components/node.js";

import './altBar.js';
import './library.js';
import './components/connections.js';
import { repeat } from "lit/directives/repeat.js";
import { Model } from "./model/model.js";

class RigatoniEditor extends LitElement {
    
    static properties = {
        library: { attribute: false },
        activeConnection: { state: true }
    }

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .sbs {
            display: flex;
            height: 100%;
        }
        .stage {
            position: relative;
            overflow: auto;
            width: 100%;
            height: 100%;
            display: block;
        }

        svg {
            user-select: none;
            pointer-events: none;
        }
    `;
    
    constructor() {
        super();
        this.library = null;
        this.model = new Model();
        this.connections = [];
    }

    get allConnections() {
        return [this.activeConnection, ...this.connections].filter(c => c !== undefined);
    }

    get connectionRenderer() {
        return this.shadowRoot.querySelector('rigatoni-connections');
    }

    render() {
        return html`

            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">

            <div class="sbs">
                <rigatoni-library
                    .library=${this.library}
                    @newnode=${this.#handleNewNode}
                ></rigatoni-library>
                <div
                    class="stage"
                    @mouseup=${this.#handleMouseUp}
                >
                    ${this.#renderNodes()}
                    <rigatoni-connections .connections=${this.allConnections}></rigatoni-connections>
                </div>
            </div>
        `;
    }

    #handleNodeDragStart(e) {
        this.draggingNode = e.detail;
        this.addEventListener('mousemove', this.#handleNodeMove);

        this.connectionRenderer
            .findNodeConnections(this.draggingNode)
            .forEach(connection => {
                let matchingPoint;
                if (connection.inputNode === this.draggingNode) matchingPoint = connection.inputPoint;
                if (connection.outputNode === this.draggingNode) matchingPoint = connection.outputPoint;

                matchingPoint.startX = matchingPoint.x;
                matchingPoint.startY = matchingPoint.y;
            })
    }

    #handleMouseUp(e) {
        if(this.draggingNode) {
            this.removeEventListener('mousemove', this.#handleNodeMove);
            this.draggingNode = undefined;
        } 
        if(this.activeConnection) {
            this.activeConnection = undefined;
            this.removeEventListener('mousemove', this.#handleConnectionMove)
            this.requestUpdate();
        }
    }

    #handleNodeMove(e) {
        const deltaX = (e.clientX - this.draggingNode.startMouseXPosition);
        const deltaY = (e.clientY - this.draggingNode.startMouseYPosition);
        this.draggingNode.x = this.draggingNode.startX + deltaX;
        this.draggingNode.y = this.draggingNode.startY + deltaY;

        this.connectionRenderer
            .findNodeConnections(this.draggingNode)
            .forEach(connection => {
                let matchingPoint;
                if (connection.inputNode === this.draggingNode) matchingPoint = connection.inputPoint;
                if (connection.outputNode === this.draggingNode) matchingPoint = connection.outputPoint;

                matchingPoint.x = matchingPoint.startX + deltaX;
                matchingPoint.y = matchingPoint.startY + deltaY;
            });
        
        this.connectionRenderer.requestUpdate();
    }

    #handleConnectionMove(e) {

        const stagePosition = this.shadowRoot.querySelector('.stage')?.getBoundingClientRect() ?? {x: 0, y:0};

        this.activeConnection.p2 = {
            x: e.clientX - stagePosition.x,
            y: e.clientY - stagePosition.y
        }
        this.requestUpdate();
    }

    #handleConnectionStart(e) {
        const {nodes, x, y} = e.detail;
        const stagePosition = this.shadowRoot.querySelector('.stage')?.getBoundingClientRect() ?? {x: 0, y:0};

        this.activeConnection = {
            p1: {
                x: x - stagePosition.x,
                y: y - stagePosition.y
            },
            p2: {
                x: x - stagePosition.x,
                y: y - stagePosition.y
            },
            nodes
        }
        this.addEventListener('mousemove', this.#handleConnectionMove);
    }

    #handleConnectionEnd(e) {
        const {connectionName, isInput, node} = e.detail;
        if (this.activeConnection) {
            this.removeEventListener('mousemove', this.#handleConnectionMove)

            // reset scenario
            // clear the connection if the same connecting node is selected
            const notMissingNode = this.activeConnection.nodes.output || this.activeConnection.nodes.input;
            if(node === notMissingNode.node) {
                // disconnect any existing connection
                const thisConnection = isInput 
                    ? node.type.inputs[connectionName] 
                    : node.type.outputs[connectionName];
                const otherNode = thisConnection.__connectedTo;
                const otherConnectionName = thisConnection.__connectedName;
                node.type.removeConnection(connectionName, isInput);
                otherNode.removeConnection(otherConnectionName, !isInput);
                const foundConnection = this.connections.find(connection => {
                    let inputNode, outputNode;
                    if (isInput) {
                        inputNode = node;
                        outputNode = otherNode.host;
                    } else {
                        inputNode = otherNode.host;
                        outputNode = node;
                    }
                    const foundInput = connection.inputNode === inputNode;
                    const foundOutput = connection.outputNode === outputNode;
                    return foundInput && foundOutput;
                });
                this.connections.splice(this.connections.indexOf(foundConnection), 1);
                this.#abortActiveConnection();
                return;
            }

            // abortable scenarios
            // the node you are connecting to already has a connection
            if (node.type.hasConnection(connectionName, isInput)) {
                this.#abortActiveConnection();
                return;
            };
            // abort scenario
            // the node you are connecting to is the same type (input => input, output => output)
            if (
                (isInput && this.activeConnection.nodes.input !== undefined) || 
                (!isInput && this.activeConnection.nodes.output !== undefined)) 
            {
                this.#abortActiveConnection();
                return;
            }
            // abortable scenarios
            // the node you are connecting from already has a connection
            const otherNode = isInput 
                ? this.activeConnection.nodes.output
                : this.activeConnection.nodes.input;
            if (otherNode.node.type.hasConnection(otherNode.connectionName, !isInput)) {
                this.#abortActiveConnection();
                return;
            }

            let inputNode, outputNode, inputName, outputName, inputPoint, outputPoint;

            if (isInput) {
                inputNode = node;
                inputName = connectionName;
                outputNode = this.activeConnection.nodes.output.node;
                outputName = this.activeConnection.nodes.output.connectionName;
                inputPoint = this.activeConnection.p2;
                outputPoint = this.activeConnection.p1;
            }
            else {
                inputNode = this.activeConnection.nodes.input.node;
                inputName = this.activeConnection.nodes.input.connectionName;
                outputNode = node;
                outputName = connectionName;
                inputPoint = this.activeConnection.p1;
                outputPoint = this.activeConnection.p2;
            }

            outputNode.type.addConnection(outputName, inputName, inputNode.type);
            this.connections.push({
                inputPoint,
                outputPoint,
                inputNode,
                outputNode

            })
            this.activeConnection = undefined;
        }
    }

    #abortActiveConnection() {
        this.activeConnection = undefined;
    }

    #handleNewNode(e) {
        this.model.addNode(e.detail);
        this.requestUpdate();
    }

    #renderNodes() {
        return repeat(
            this.model.nodes,
            (n) => this.model.nodes.indexOf(n),
            (n) => html`
            <rigatoni-node
                @inputchange=${this.#handleInputChange(n)}
                @connectionstart=${this.#handleConnectionStart}
                @connectionend=${this.#handleConnectionEnd}
                @dragstart=${this.#handleNodeDragStart}
                .type=${n}
            >
            </rigatoni-node>`
        )
    }

    #handleInputChange(n) {
        return ({detail: {inputName, value}}) => {
            n.setInput(inputName, value);
        }
    }
}

customElements.define('rigatoni-editor', RigatoniEditor);