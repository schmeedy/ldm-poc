ldm.diagram.LdmDiagram = function(canvasId, semanticModelId) {
    var diagram = this;

    diagram.scope = angular.element($("#" + canvasId).get(0)).scope();

    diagram.canvas = new draw2d.Canvas(canvasId);
    diagram.canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGeometryEditPolicy());

    var selectionPolicy = new draw2d.policy.canvas.BoundingboxSelectionPolicy();
    diagram.canvas.installEditPolicy(selectionPolicy);

    var selectionSynchronizer = new ldm.diagram.SelectionSynchronizer(this, selectionPolicy, this.scope);
    selectionSynchronizer.start();

    diagram.getDatasets = function() {
        var datasets = new draw2d.util.ArrayList();
        diagram.canvas.figures.each(function(i, figure) {
            if (figure.modelType === "dataset") {
                datasets.add(figure);
            }
        });
        return datasets;
    };

    diagram.getDataset = function(dataset) {
        var datasetFigure = null;
        var dsId = typeof dataset === "string" ? dataset : dataset.id;
        diagram.getDatasets().each(function(i, ds) {
            if (ds.model.id === dsId) {
                datasetFigure = ds;
            }
        });
        return datasetFigure;
    };

    diagram.asyncModelUpdate = function(runnable) {
        function doUpdate() {
            diagram.scope.$apply(runnable);
        }
        setTimeout(doUpdate, 5);
    };

    var DatasetSynchronizer = ldm.diagram.AbstractListFeatureSynchronizer.extend({

        init: function() {
            var self = this;
            diagram.scope.$watch("datasets.length", function() {
                function doSynchronize() {
                    self.synchronize.apply(self);
                }
                setTimeout(doSynchronize, 50);
            });
        },

        getModels: function() {
            return diagram.scope.datasets;
        },

        getViews: function() {
            return diagram.getDatasets();
        },

        createView: function(model) {
            diagram.createDataset(model);
        },

        destroyView: function(view) {
            diagram.removeDataset(view);
        }

    });
    var datasetSynchronizer = new DatasetSynchronizer();
    datasetSynchronizer.init();

    diagram.reload = function() {
        datasetSynchronizer.synchronize();
        diagram.scope.$digest();
    };

    function findEmptySpace() {
        for (var y = 50; y < 300; y += 50) {
            for (var x = 50; x < 800; x += 50) {
                if (diagram.canvas.getBestFigure(x, y) === null) {
                    return { x: x, y: y };
                }
            }
        }
        return null;
    }

    diagram.getScope = function(datasetModel) {
        var semanticElement = $("#" + semanticModelId + " div[data-id=\"" + datasetModel.id + "\"]").get(0);
        return angular.element(semanticElement).scope();
    };

    diagram.createDataset = function(model) {
        var dsScope = this.getScope(model);
        var ds = new ldm.diagram.figure.DatasetFigure(model, dsScope, this);

        var loc = findEmptySpace();
        if (loc === null) {
            loc = {x: 100, y: 50}; // default location
        }
        diagram.canvas.addFigure(ds, loc.x, loc.y);

        var ReferenceSynchronizer = ldm.diagram.AbstractListFeatureSynchronizer.extend({

            init: function() {
                var self = this;
                var scope = dsScope;
                scope.$watch("dataset.references.length", function() {
                    self.synchronize.apply(self);
                });
            },

            getModels: function() {
                return model.references ? model.references : [];
            },

            getViews: function() {
                return ds.getReferences();
            },

            getModelIdFromView: function(view) {
                return view.datasetId;
            },

            createView: function(model) {
                ds.createConnectionTo(model);
            },

            destroyView: function(view) {
                diagram.canvas.removeFigure(view.connection);
            }

        });
        var referenceSynchronizer = new ReferenceSynchronizer();
        referenceSynchronizer.init();

        return ds;
    };

    diagram.removeDataset = function(dataset) {
        dataset.getOutputPort(0).getConnections().each(function(i, outgoingConnection) {
            diagram.canvas.removeFigure(outgoingConnection);
        });
        diagram.canvas.removeFigure(dataset);
    };

    return diagram;
};