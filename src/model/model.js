
export class Model {

    constructor() {
        this.nodes = [];
        this.connections
    }

    addNode(type) {
        this.nodes.push(new type());
    }

    run() {
        this.nodes.forEach(node => node.onRun && node.onRun());
    }
}