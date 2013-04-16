var LDM = function(canvasId) {
    var canvas = new draw2d.Canvas(canvasId);
    canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGeometryEditPolicy());

    function findEmptySpace() {
        for (var y = 50; y < 300; y += 50) {
            for (var x = 50; x < 800; x += 50) {
                if (canvas.getBestFigure(x, y) == null) {
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

        canvas.addFigure(figure, loc.x, loc.y);
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
                canvas.addFigure(c);
            }
        };
    };

    return this;
};

$(window).load(function () {
    var ldm = new LDM("ldm-canvas");
    window.ds1 = ldm.newDataset({id: "dataset.person", title: "Person"});
    window.ds2 = ldm.newDataset({id: "dataset.department", title: "Department"});
    ds1.connectTo(ds2);

    $("#new-dataset").click(function() {
        ldm.newDataset({id: "", title: ""});
    });
});