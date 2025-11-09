import { css, html, LitElement } from "lit";

class RigatoniButton extends LitElement {

    static styles = css`
        button { 
            border: none;
            border-radius: 8px;
            background-color: #2E5BFF;
            color: white;
            padding: 10px;
            cursor: pointer;
            transition: background-color .2s ease-out;
            width: 100%;
        }

        button:hover {
            background-color: #1E3EB5;
        }

        :host[secondary] > button {
            background-color: #C3C8D1;
            color: #1C1E21;
        }
    `

    render() {
        return html`
            <button>
                <slot></slot>
            </button>
        `
    }
}

customElements.define('rigatoni-button', RigatoniButton);