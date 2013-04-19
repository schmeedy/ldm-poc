ldm.diagram.AbstractListFeatureSynchronizer = Class.extend({

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