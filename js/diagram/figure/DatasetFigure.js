ldm.diagram.figure.DatasetFigure = draw2d.shape.basic.Rectangle.extend({

    init: function(model, scope, diagram) {
        this._super(100, 50);

        this.model = model;
        this.modelType = "dataset";

        this.scope = scope;
        this.diagram = diagram;

        this.setId(this.modelType + ":" + model.id);

        this.setMinWidth(100).setMinHeight(50);

        this.setBackgroundColor("#D5F8CA");
        this.setResizeable(false);

        this.createPort("input");
        this.createPort("output");

        var titleEditor = new ldm.diagram.figure.TextEditor(this.scope, this.model, "dataset", "title");
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
        var targetDsFigure = this.diagram.getDataset(targetDsModel);
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
        var targetDsFigure = this.diagram.getDataset(targetDsModel);
        if (!targetDsFigure) {
            return;
        }
        var scope = this.scope;
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
        var targetDsFigure = this.diagram.getDataset(targetDsModel);
        if (!targetDsFigure) {
            return;
        }
        var scope = this.scope;
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
        var scope = this.scope;

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

        var targetDsFigure = this.diagram.getDataset(targetDsModel);
        if (!targetDsFigure || this.isConnectedTo(targetDsModel)) {
            return;
        }
        var c = new DatasetConnection();
        c.setSource(this.getOutputPort(0));
        c.setTarget(targetDsFigure.getInputPort(0));
        this.diagram.canvas.addFigure(c);
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