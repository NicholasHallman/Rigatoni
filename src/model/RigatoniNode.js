

export class RigatoniNode {

    constructor() {
        this.parseConnections();
    }

    get name() {
        return this.constructor.name;
    }

    addHost(host) {
        this.host = host;
    }

    propogate() {
        // propogate the results of a calculation to the connected nodes
        Object.entries(this.outputs).forEach(([outputName, output]) => {
            if(output.__connectedTo) {
                output.__connectedTo.setInput(
                    output.__connectedName,
                    this[outputName]
                );
                output.__connectedTo?.host?.requestUpdate();
            }
        })
    }

    setInput(name, value) {
        if(this.constructor.inputs[name]) {
            switch(this.constructor.inputs[name].type) {
                case Number:
                    this[name] = Number(value);
                    break;
                case String:
                    this[name] = `${value}`;
                    break;
                case Object:
                    if(typeof value === 'string') {
                        this[name] = JSON.parse(value);
                        break;
                    }
                default:
                    this[name] = value;
                    break;
            }
        }
        if(this.onUpdate) {
            try {
                if(this.onUpdate()) {
                    this.propogate();
                }
            } catch {}
        } else {
            this.propogate();
        }
        this.host.requestUpdate();
    }

    parseConnections() {
        if(this.constructor.inputs) {
            this.inputs = Object.entries(this.constructor.inputs)
                .reduce((acc, [inputName, info]) => {
                    acc[inputName] = {
                        connectedTo: null,
                        ...info
                    };
                    return acc;
                }, {});
        } else this.inputs = {};

         if(this.constructor.outputs) {
            this.outputs = Object.entries(this.constructor.outputs)
                .reduce((acc, [outputName, info]) => {
                    acc[outputName] = {
                        connectedTo: null,
                        ...info
                    };
                    return acc;
                }, {});
        } else this.outputs = {};
    }

    hasConnection(connectionName, isInput) {
        return isInput 
            ? this.inputs[connectionName].__connectedTo !== undefined
            : this.outputs[connectionName].__connectedTo !== undefined;
    }

    addConnection(fromOutputName, toInputName, inputNode, id) {
        const output = this.outputs[fromOutputName];
        if(output) {
            output.connectedTo = inputNode;
        } else {
            console.error("Could not find Input ", inputName);
        }
        this.outputs[fromOutputName].__connectedTo = inputNode;
        this.outputs[fromOutputName].__connectedName = toInputName;
        this.outputs[fromOutputName].__connectedId = id;

        inputNode.inputs[toInputName].__connectedTo = this;
        inputNode.inputs[toInputName].__connectedName = fromOutputName;
        inputNode.setInput(
            toInputName,
            this[fromOutputName]
        );
        this.host?.requestUpdate();
        inputNode?.host?.requestUpdate();
    }

    removeConnection(connectionName, isInput) {
        if (isInput) {
            this.inputs[connectionName].__connectedTo = undefined;
            this.inputs[connectionName].__connectedName = undefined;
        } else {
            this.outputs[connectionName].__connectedTo = undefined;
            this.outputs[connectionName].__connectedName = undefined;
        }
        this.host.requestUpdate();
    }
}