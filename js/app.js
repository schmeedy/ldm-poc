var LDM = function(canvasId) {
    var ldm = this;

    ldm.canvas = new draw2d.Canvas(canvasId);
    ldm.canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGeometryEditPolicy());

    ldm.initUndoRedoButtons = function(undoButton, redoButton) {
        ldm.canvas.getCommandStack().addEventListener({
            stackChanged: function(event) {
                function setEnabled(button, enabled) {
                    if (enabled) {
                        button.removeClass("disabled");
                    } else {
                        button.addClass("disabled");
                    }
                }

                setEnabled(undoButton, event.getStack().canUndo());
                setEnabled(redoButton, event.getStack().canRedo());
            }
        });

        undoButton.click(function() {
            ldm.canvas.getCommandStack().undo();
        });
        redoButton.click(function() {
            ldm.canvas.getCommandStack().redo();
        });
    };

    function findEmptySpace() {
        for (var y = 50; y < 300; y += 50) {
            for (var x = 50; x < 800; x += 50) {
                if (ldm.canvas.getBestFigure(x, y) == null) {
                    return { x: x, y: y };
                }
            }
        }
        return null;
    }

    function PropertyEditor(model, property) {
        var editor = new draw2d.shape.basic.Label(model[property]);
        editor.installEditor(new draw2d.ui.LabelInplaceEditor());
        editor.setStroke(0);
        return editor;
    }

    this.newDataset = function(model) {
        var figure = new draw2d.shape.basic.Rectangle();
        figure.setMinWidth(100).setMinHeight(50).setDimension(100, 50);
        figure.model = model;

        var loc = findEmptySpace();
        if (loc == null) {
            loc = {x: 100, y: 50}; // default location
        }

        ldm.canvas.getCommandStack().execute(new draw2d.command.CommandAdd(ldm.canvas, figure, loc.x, loc.y));

        figure.setBackgroundColor("#D5F8CA");
        figure.setResizeable(false);

        figure.createPort("input");
        var outPort = figure.createPort("output");
        outPort.onConnect = function(connection) {
            connection.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
        };

        var titleEditor = new PropertyEditor(model, "title");
        figure.addFigure(titleEditor, new draw2d.layout.locator.CenterLocator(figure));

        figure.onDoubleClick = function () { titleEditor.onDoubleClick(); };

        return {
            model: model,
            figure: figure,

            isConnectedTo: function(targetDataset) {
                var connections = figure.getOutputPort(0).getConnections();
                for (var i = 0; i < connections.getSize(); i++) {
                    var targetPort = connections.get(i).getTarget();
                    var targetFigure = targetPort == null ? null : targetPort.getParent();
                    if (targetFigure == targetDataset.figure) {
                        return true;
                    }
                }
                return false;
            },

            connectTo: function(targetDataset) {
                if (this.isConnectedTo(targetDataset)) {
                    return;
                }
                var c = new draw2d.Connection();
                c.setSource(figure.getOutputPort(0));
                c.setTarget(targetDataset.figure.getInputPort(0));
                ldm.canvas.getCommandStack().execute(new draw2d.command.CommandAdd(ldm.canvas, c));
            }
        };
    };

    return ldm;
};

$(window).load(function () {
    var ldm = new LDM("ldm-canvas");
    ldm.initUndoRedoButtons($(".toolbar .undo"), $(".toolbar .redo"))
    var ds1 = ldm.newDataset({id: "dataset.person", title: "Person"});
    var ds2 = ldm.newDataset({id: "dataset.department", title: "Department"});
    ds1.connectTo(ds2);

    ldm.canvas.getCommandStack().markSaveLocation(); // discard undo stack

    $("#new-dataset").click(function() {
        ldm.newDataset({id: "", title: ""});
    });
});