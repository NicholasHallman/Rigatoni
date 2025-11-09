import { LitElement } from "lit";
import { iconMap } from './icons/index.js';

class RigatoniIcons extends LitElement {

    static properties = {
        icon: { type: String }
    }

    render() {
        return iconMap[this.icon];
    }
}

customElements.define('rigatoni-icons', RigatoniIcons);