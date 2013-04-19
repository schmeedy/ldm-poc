ldm.diagram.figure.TextEditor = draw2d.shape.basic.Label.extend({

    init : function(scope, modelObject, modelName, property) {
        this._super(modelObject[property]);
        var self = this;

        self.setStroke(0);
        var binding = modelName + "." + property;
        scope.$watch(binding, function(newValue) {
            self.setText(newValue);
        });

        self.installEditor(new draw2d.ui.LabelInplaceEditor({
            onCommit: function(value) {
                scope.$apply(function() {
                    scope[modelName][property] = value;
                });
            }
        }));
    }

});