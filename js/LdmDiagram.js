var LdmDiagram = function(canvasId, semanticModelId) {
    var diagram = this;

    diagram.scope = angular.element($("#" + canvasId).get(0)).scope();

    diagram.canvas = new draw2d.Canvas(canvasId);
    diagram.canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGeometryEditPolicy());

    diagram.isDataset = function(figure) {
        return figure.id != null && figure.id.length > 1 && figure.id.substr(0, 2) == "ds";
    };

    var datasetSynchronizer = (function() {

        var self = this;

        self.getDatasetFigures = function() {
            var datasets = new draw2d.util.ArrayList();
            diagram.canvas.figures.each(function(i, figure) {
                if (diagram.isDataset(figure)) {
                    datasets.add(figure);
                }
            });
            return datasets;
        };

        self.syncDatasets = function() {
            var datasets = diagram.scope.datasets;

            var addedDatasets = new draw2d.util.ArrayList();
            var currentDsIds = new draw2d.util.ArrayList();

            for (var i = 0; i < datasets.length; i++) {
                var dataset = datasets[i];
                var figureId = getDatasetFigureId(dataset);
                if (diagram.canvas.getFigure(figureId) == null) {
                    addedDatasets.add(dataset);
                }
                currentDsIds.add(figureId);
            }

            // create new datasets
            addedDatasets.each(function(i, newDs) {
                diagram.newDataset(newDs);
            });

            // remove deleted datasets
            self.getDatasetFigures().each(function(i, dsFigure) {
                if (!currentDsIds.contains(dsFigure.id)) {
                    diagram.canvas.removeFigure(dsFigure);
                }
            });
        };

        self.init = function() {
            diagram.scope.$watch("datasets.length", function() {
                setTimeout(self.syncDatasets, 50);
            });
        };

        return this;

    })();
    datasetSynchronizer.init();

    diagram.reload = function() {
        datasetSynchronizer.syncDatasets();
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

    function getDatasetFigureId(datasetModel) {
        return "ds:" + datasetModel.id;
    }

    diagram.newDataset = function(model) {
        var figure = new draw2d.shape.basic.Rectangle();
        figure.model = model;
        figure.setId(getDatasetFigureId(model));
        figure.setMinWidth(100).setMinHeight(50).setDimension(100, 50);

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

        var ds =  {
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

        return ds;
    };

    return diagram;
};