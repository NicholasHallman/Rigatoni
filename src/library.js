import { css, html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat.js";

class RigatoniLibrary extends LitElement {

    static properties = {
        library: { attribute: false }
    }

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            width: 230px;
            height: 100%;
            background-color: #1C1E21;
            padding: 0px 10px 0px 10px;
            font-family: "Inter", sans-serif;
            font-optical-sizing: auto;
            font-style: normal;
            color: white;
        }

        rigatoni-button {
            width: 100%;
            margin-top: 10px;
        }
    `;

    render() {
        return [
            html`<h2>Node Library</h2>`,
            repeat(this.library,
                (t) => t.name,
                (t) => html`<rigatoni-button @click=${this.#handleAddNode(t)}>${t.name}</rigatoni-button>`
                
            )
        ]
    }

    #handleAddNode(t) {
        return () => {
            this.dispatchEvent(new CustomEvent('newnode', {
                detail: t
            }))
        };
    }
}

customElements.define('rigatoni-library', RigatoniLibrary);