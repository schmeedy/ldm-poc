var LdmEditorCtrl = function($scope) {
    $scope.model = [
        { id: "dataset.person", title: "Person" },
        { id: "dataset.department", title: "Department" }
    ];
}

var LdmDiagram = function(canvasId, semanticModelId) {
    var diagram = this;

    diagram.scope = angular.element($("#" + canvasId).get(0)).scope();

    diagram.canvas = new draw2d.Canvas(canvasId);
    diagram.canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGeometryEditPolicy());

    diagram.initUndoRedoButtons = function(undoButton, redoButton) {
        diagram.canvas.getCommandStack().addEventListener({
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
            diagram.canvas.getCommandStack().undo();
        });
        redoButton.click(function() {
            diagram.canvas.getCommandStack().redo();
        });
    };

    diagram.reload = function() {
        diagram.canvas.clear();

        for (var i = 0; i < diagram.scope.model.length; i++) {
            var dsModel = diagram.scope.model[i];
            diagram.newDataset(dsModel);
        }

        diagram.canvas.getCommandStack().markSaveLocation(); // discard undo stack
    };

    function findEmptySpace() {
        for (var y = 50; y < 300; y += 50) {
            for (var x = 50; x < 800; x += 50) {
                if (diagram.canvas.getBestFigure(x, y) == null) {
                    return { x: x, y: y };
                }
            }
        }
        return null;
    }

    function TextEditor(modelObject, modelName, property) {
        var label = new draw2d.shape.basic.Label(modelObject[property]);
        label.setStroke(0);

        var scope = getScope(modelObject);
        var binding = modelName + "." + property;
        scope.$watch(binding, function (newValue) {
            label.setText(newValue);
        })

        label.installEditor(new draw2d.ui.LabelInplaceEditor({
            onCommit: function(value) {
                scope.$apply(function() {
                    scope[modelName][property] = value;
                });
            }
        }));

        return label;
    }

    function getScope(model) {
        var semanticElement = $("#" + semanticModelId + " div[data-id=\"" + model.id + "\"]").get(0);
        return angular.element(semanticElement).scope();
    }

    diagram.newDataset = function(model) {
        var figure = new draw2d.shape.basic.Rectangle();
        figure.setMinWidth(100).setMinHeight(50).setDimension(100, 50);
        figure.model = model;

        var loc = findEmptySpace();
        if (loc == null) {
            loc = {x: 100, y: 50}; // default location
        }

        diagram.canvas.getCommandStack().execute(new draw2d.command.CommandAdd(diagram.canvas, figure, loc.x, loc.y));

        figure.setBackgroundColor("#D5F8CA");
        figure.setResizeable(false);

        figure.createPort("input");
        var outPort = figure.createPort("output");
        outPort.onConnect = function(connection) {
            connection.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
        };

        var titleEditor = new TextEditor(model, "dataset", "title");
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
                diagram.canvas.getCommandStack().execute(new draw2d.command.CommandAdd(diagram.canvas, c));
            }
        };
    };

    return diagram;
};

$(window).load(function () {
    var diagram = new LdmDiagram("diagram-canvas", "diagram-sematic-model");
    diagram.initUndoRedoButtons($(".toolbar .undo"), $(".toolbar .redo"));
    diagram.reload();

    $("#new-dataset").click(function() {
        diagram.newDataset({id: "", title: ""});
    });
});