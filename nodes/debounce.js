module.exports = function(RED) {
    function DebounceAdvancedNode(config) {

        RED.nodes.createNode(this, config);
        this.timeunit = config.timeunit || 's';
        this.timeInput = Math.max(config.time || 5, 0);
        switch (this.timeunit) {
            case 's':
                this.time = this.timeInput * 1000;
                break;
            case 'm':
                this.time = this.timeInput * 1000 * 60;
                break;
            default: //ms
                this.time = this.timeInput;
                break;
        }

        this.name = config.name; // + " " + this.timeInput + " " + this.timeunit;
        this.debouncetype = config.debouncetype || "leading";

        let context = this.context();
        let node = this;

        this.on('input', function (msg) {
            let oldTimeout = context.get('timeout');
            let lastTimestamp = context.get('timestamp');
            let currentTimestamp = Date.now();
            let interval = currentTimestamp - lastTimestamp || node.time;

            if (oldTimeout) {
                clearTimeout(oldTimeout);
            }

            if (node.debouncetype === "trailing" || interval < node.time) {
                let timeout = setTimeout(function () {
                    node.send(msg);
                    node.status({text: ""})
                }, node.time);

                node.status({text: "waiting (" + node.debouncetype + ")"})
                context.set('timeout', timeout);
            }

            if (node.debouncetype === "leading" && interval >= node.time) {
                node.send(msg);
                node.status({text: ""})
                context.set('timestamp', currentTimestamp);
            }
        });
    }

    RED.nodes.registerType('debounce-advanced', DebounceAdvancedNode);
};
