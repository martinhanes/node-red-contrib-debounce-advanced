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

        const STATUS_TIMEOUT = 10000;
        let context = this.context();
        let node = this;

        function setStatusMessageTemp(fill, text) {
            let oldTimeout = context.get('statusTimeout');
            if (oldTimeout) {
                clearTimeout(oldTimeout)
            }

            node.status({fill: fill, text: text})

            const statusTimeout = setTimeout(function () {
                node.status({})
            }, STATUS_TIMEOUT);

            context.set('statusTimeout', statusTimeout);
        }

        function formatDate(input) {
            return input.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            });
        }

        this.on('input', function (msg) {

            let oldTimeout = context.get('timeout');
            let lastTimestamp = context.get('timestamp');
            let currentTimestamp = Date.now();
            let interval = currentTimestamp - lastTimestamp || node.time;

            // we do clear old timer in all cases - either flush, reset or trailing
            // for leading - we don't have timeout
            if (oldTimeout) {
                clearTimeout(oldTimeout);
            }

            if (msg.hasOwnProperty("flush")) {
                setStatusMessageTemp("green", "flushed at: " + formatDate(new Date()))
                node.send(msg);
                return;
            }

            if (msg.hasOwnProperty("reset")) {
                // node.status({text: ""})
                setStatusMessageTemp("red", "reset at: " + formatDate(new Date()))
                return;
            }

            // in case we should wait
            if (node.debouncetype === "trailing" || interval < node.time) {
                let timeout = setTimeout(function () {
                    node.status({fill: "green", text: formatDate(new Date())})
                    node.send(msg);
                }, node.time);

                node.status({fill: "blue", text: "waiting (" + node.debouncetype + ")"})
                context.set('timeout', timeout);
            }

            if (node.debouncetype === "leading" && interval >= node.time) {
                node.send(msg);
                node.status({fill: "green", text: formatDate(new Date())})
                context.set('timestamp', currentTimestamp);
            }
        });
    }

    RED.nodes.registerType('debounce-advanced', DebounceAdvancedNode);
};
