"use strict";

var AbstractListFeatureSynchronizer = Class.extend({

    synchronize: function() {
        var self = this;

        var targetModelIds = new draw2d.util.ArrayList();

        var models = self.getModels();
        for (var i = 0; i < models.length; i++) {
            var model = models[i];
            targetModelIds.add(model.id);
        }

        var modelsWithoutViews = new draw2d.util.ArrayList();
        modelsWithoutViews.addAll(targetModelIds);
        var views = self.getViews();
        views.each(function(i, view) {
            var modelId = self.getModelIdFromView(view);
            modelsWithoutViews.remove(modelId);
            if (!targetModelIds.contains(modelId)) {
                self.destroyView(view);
            }
        });

        for (var y = 0; y < models.length; y++) {
            var m = models[y];
            if (modelsWithoutViews.contains(m.id)) {
                self.createView(m);
            }
        }
    },

    getModels: function() {},

    getViews: function() {},

    getModelIdFromView: function(view) {
        return view.model.id;
    },

    createView: function(model) {},

    destroyView: function(view) {}

});

var LdmDiagram = function(canvasId, semanticModelId) {
    var diagram = this;

    diagram.scope = angular.element($("#" + canvasId).get(0)).scope();

    diagram.canvas = new draw2d.Canvas(canvasId);
    diagram.canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGeometryEditPolicy());

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

    var DatasetSynchronizer = AbstractListFeatureSynchronizer.extend({

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

    function TextEditor(modelObject, modelName, property) {
        var label = new draw2d.shape.basic.Label(modelObject[property]);
        label.setStroke(0);

        var scope = getScope(modelObject);
        var binding = modelName + "." + property;
        scope.$watch(binding, function (newValue) {
            label.setText(newValue);
        });

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

    var DatasetFigure = draw2d.shape.basic.Rectangle.extend({

        init: function(model) {
            this._super(100, 50);

            this.model = model;
            this.modelType = "dataset";

            this.setId(this.modelType + ":" + model.id);

            this.setMinWidth(100).setMinHeight(50);

            this.setBackgroundColor("#D5F8CA");
            this.setResizeable(false);

            this.createPort("input");
            this.createPort("output");

            var titleEditor = new TextEditor(model, "dataset", "title");
            this.addFigure(titleEditor, new draw2d.layout.locator.CenterLocator(this));

            this.onDoubleClick = function () { titleEditor.onDoubleClick(); };
        },

        /**
         * @override
         */
        createPort: function(type, locator){
            if (type === "output") {
                var port = this.createOutputPort();
                this.addPort(port, locator);
                // relayout the ports
                this.setDimension(this.width,this.height);
                return port;
            } else {
                return this._super(type, locator);
            }
        },

        createOutputPort: function() {
            var ConnectDatasetsCommand = draw2d.command.Command.extend({
                init : function(sourceDs, targetDs) {
                    this._super("Connect Datasets");

                    this.source = sourceDs;
                    this.target = targetDs;
                },

                execute: function() {
                    this.source.ensureReference(this.target.model);
                }
            });

            var DatasetOutputPort = draw2d.OutputPort.extend({
                init : function(name) {
                    this._super(name);
                },

                createCommand: function(request) {
                    if (request.getPolicy() !== draw2d.command.CommandType.CONNECT) {
                        return this._super(request);
                    }
                    if (request.source.getParent().getId() === request.target.getParent().getId()) {
                        return null; // loopback
                    }
                    if (!(request.source instanceof draw2d.InputPort || request.source instanceof draw2d.HybridPort)) {
                        return null; // invalid port type
                    }

                    return new ConnectDatasetsCommand(request.target.getParent(), request.source.getParent());
                }
            });
            return new DatasetOutputPort("input" + this.inputPorts.getSize());
        },

        getReferences: function() {
            var references = new draw2d.util.ArrayList();
            var connections = this.getOutputPort(0).getConnections();
            connections.each(function(i,conn) {
                var targetPort = connections.get(0).getTarget();
                var targetFigure = targetPort ? targetPort.getParent() : null;

                references.add({
                    connection: conn,
                    datasetFigure: targetFigure,
                    datasetId: targetFigure ? targetFigure.model.id : null
                });
            });
            return references;
        },

        isConnectedTo: function(targetDsModel) {
            var targetDsFigure = diagram.getDataset(targetDsModel);
            if (!targetDsFigure) {
                return false;
            }
            var references = this.getReferences();
            for (var i = 0; i < references.length; i++) {
                if (references.get(i).datasetFigure === targetDsFigure) {
                    return true;
                }
            }
            return false;
        },

        ensureReference: function(targetDsModel) {
            var targetDsFigure = diagram.getDataset(targetDsModel);
            if (!targetDsFigure) {
                return;
            }
            var scope = getScope(this.model);
            scope.$apply(function() {
                if (!scope.dataset.references) {
                    scope.dataset.references = [];
                }
                if ($.inArray(targetDsFigure.model.id, scope.dataset.references) < 0) {
                    scope.dataset.references.push(targetDsFigure.model.id);
                }
            });
        },

        removeReference: function(targetDsModel) {
            var targetDsFigure = diagram.getDataset(targetDsModel);
            if (!targetDsFigure) {
                return;
            }
            var scope = getScope(this.model);
            scope.$apply(function() {
                if (!scope.dataset.references) {
                    return;
                }
                var index = $.inArray(targetDsFigure.model.id, scope.dataset.references);
                if (index >= 0) {
                    scope.dataset.references.splice(index, 1);
                }
            });
        },

        dispose: function() {
            var selfModel = this.model;
            var scope = getScope(this.model);

            scope.$apply(function() {
                scope.removeDataset(selfModel);
            });
        },

        createConnectionTo: function(targetDsModel) {
            var self = this;

            var RemoveDatasetConnection = draw2d.command.Command.extend({
                init : function(connection) {
                    this._super("Disconnect Datasets");

                    this.connection = connection;
                },

                execute: function() {
                    var targetDs = this.connection.getTarget().getParent();
                    if (targetDs) {
                        self.removeReference(targetDs.model);
                    }
                }
            });

            var DatasetConnection = draw2d.Connection.extend({
                init: function(router) {
                   this._super(router);
                   this.setTargetDecorator(new draw2d.decoration.connection.ArrowDecorator());
                },

                createCommand:function(request) {
                    if (request.getPolicy() === draw2d.command.CommandType.DELETE) {
                        return new RemoveDatasetConnection(this);
                    }

                    return this._super(request);
                }
            });

            var targetDsFigure = diagram.getDataset(targetDsModel);
            if (!targetDsFigure || this.isConnectedTo(targetDsModel)) {
                return;
            }
            var c = new DatasetConnection();
            c.setSource(this.getOutputPort(0));
            c.setTarget(targetDsFigure.getInputPort(0));
            diagram.canvas.addFigure(c);
        },

        createCommand: function(request) {
            var DeleteDatasetCommand = draw2d.command.Command.extend({
                init : function(dataset) {
                    this._super("Delete Dataset");

                    this.dataset = dataset;
                },

                execute: function() {
                    this.dataset.dispose();
                }
            });

            if (request.getPolicy() === draw2d.command.CommandType.DELETE) {
                return new DeleteDatasetCommand(this);
            }

            return this._super(request);
        }

    });

    diagram.createDataset = function(model) {
        var ds = new DatasetFigure(model);

        var loc = findEmptySpace();
        if (loc === null) {
            loc = {x: 100, y: 50}; // default location
        }
        diagram.canvas.addFigure(ds, loc.x, loc.y);

        var ReferenceSynchronizer = AbstractListFeatureSynchronizer.extend({

            init: function() {
                var self = this;
                var scope = getScope(model);
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