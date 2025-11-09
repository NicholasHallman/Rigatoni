import { css, html, LitElement } from "lit";

class AltBar extends LitElement {

    static styles = css`
        :host {
            display: flex;
            justify-content: flex-end;
            width: calc(100% - 14px);
            background-color: #1C1E21;
            padding: 4px;
            padding-right: 10px;
        }
    `;

    render() {
        return html`
            <rigatoni-button @click=${this.#handleRun}>Run</rigatoni-button>
        `
    }

    #handleRun() {
        this.dispatchEvent(new CustomEvent('run'))
    }

}

customElements.define('rigatoni-altbar', AltBar)