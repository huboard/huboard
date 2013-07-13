define(["../mousetrap", "common/events/postal"], function (mousetrap, postal) {
    return {
        help: function () {
            postal.publish("Shortcut.Help");
        },
        exit: function () {
            postal.publish("Shortcut.Exit");
        },
        search: function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            postal.publish("Shortcut.Search");
        },
        init: function () {
            mousetrap.bind('?', this.help);
            mousetrap.bind('/', this.search);
            mousetrap.bind('esc', this.exit);
        }
    }
});