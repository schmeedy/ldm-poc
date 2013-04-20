(function() {
    "use strict";

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

    var DatasetInputPort = draw2d.InputPort.extend({
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
            if (!(request.source instanceof draw2d.OutputPort || request.source instanceof draw2d.HybridPort)) {
                return null; // invalid port type
            }

            return new ConnectDatasetsCommand(request.source.getParent(), request.target.getParent());
        }
    });

    ldm.diagram.figure.DatasetFigure = draw2d.shape.basic.Rectangle.extend({

        init: function(model, scope, diagram) {
            this._super(100, 50);

            this.model = model;
            this.modelType = "dataset";

            this.scope = scope;
            this.diagram = diagram;

            this.setId(this.modelType + ":" + model.id);

            this.setMinWidth(100).setMinHeight(50);

            if (this.isDateDimension()) {
                this.setBackgroundColor("#E8F2FC");
            } else {
                this.setBackgroundColor("#D5F8CA");
            }

            this.createPort("input");

            if (!this.isDateDimension()) {
                this.createPort("output");
            }

            var titleEditor = new ldm.diagram.figure.TextEditor(this.scope, this.model, "dataset", "title");
            this.addFigure(titleEditor, new draw2d.layout.locator.CenterLocator(this));

            this.onDoubleClick = function () { titleEditor.onDoubleClick(); };

            var self = this;

            titleEditor.onMouseEnter = function() {
                self.onMouseEnter();
            };

            titleEditor.onMouseLeave = function() {
                self.onMouseLeave();
            };

            this.tooltip = null;
        },

        isDateDimension: function() {
            return this.model.type === "date-dimension";
        },

        /**
         * @override
         */
        createPort: function(type, locator){
            var port = null;
            if (type === "output") {
                port = new DatasetOutputPort("input" + this.inputPorts.getSize());
            } else if (type === "input") {
                port = new DatasetInputPort("output" + this.outputPorts.getSize());
            }

            if (port) {
                this.addPort(port, locator);
                this.setDimension(this.width,this.height); // relayout the ports
                return port;
            } else {
                return this._super(type, locator);
            }
        },

        getReferences: function() {
            var references = new draw2d.util.ArrayList();
            if (this.isDateDimension()) {
                return references; // date dimension has no references
            }

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
        },

        onDragStart: function(){
            this.hideTooltip();
            this._super();
        },

        onDragEnd: function(){
            this._super();
            this.showTooltip();
        },

        onMouseEnter: function() {
            this.showTooltip();
        },

        onMouseLeave: function() {
            this.hideTooltip();
        },

        setPosition: function(x, y) {
            this._super(x, y);
            this.positionTooltip();
        },

        hideTooltip: function() {
            if (this.tooltip) {
                this.tooltip.remove();
            }
            this.tooltip = null;
        },


        // TODO some icons ?
        showTooltip: function() {
            function constructTooltip(ds) {
                var content = '<div class="modal ds-tooltip"><div class="modal-body"> <ul>',
                    innerContent = '',
                    i;

                if (ds.attributes) {
                    for (i = 0; i < ds.attributes.length; ++i) {
                        innerContent += '<li>' + ds.attributes[i].title + "</li>";
                    }
                }

                if (ds.facts) {
                    for (i = 0; i < ds.facts.length; ++i) {
                        innerContent += '<li>' + ds.facts[i].title + "</li>";
                    }
                }

                if (!innerContent) {
                    return null;
                }

                content += innerContent + '</div></ul></div>';
                return content;
            }

            var tooltipContent = constructTooltip(this.model);
            if (!tooltipContent) {
                return;
            }
            this.tooltip = $(tooltipContent).appendTo('#diagram-canvas');
            this.positionTooltip();
        },

        positionTooltip: function() {
            if (!this.tooltip) {
                return;
            }
            var width = this.tooltip.outerWidth(true);
            var tPosX = this.getAbsoluteX() + this.getWidth() / 2 - width / 2 + 8;
            var tPosY = this.getAbsoluteY() + this.getHeight() + 20;
            this.tooltip.css({'top': tPosY, 'left': tPosX});
        }

    });
})();