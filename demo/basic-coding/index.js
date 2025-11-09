import { LitElement, html } from 'lit';
import '../../src/rigatoni.js';
import { Sum } from './nodes/sum.js';
import { ConsoleLog } from './nodes/log.js';
import { Subtract } from './nodes/Subtract.js';
import { Num } from './nodes/Number.js';

class BasicCodingRigatoni extends LitElement {

    render() {
        return html`
            <rigatoni-editor
                .library = ${[
                    Sum,
                    ConsoleLog,
                    Subtract,
                    Num
                ]}
            ></rigatoni-editor>
        `;
    }
}

customElements.define('rigatoni-code-demo', BasicCodingRigatoni);