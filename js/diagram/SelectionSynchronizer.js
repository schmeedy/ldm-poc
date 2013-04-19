ldm.diagram.SelectionSynchronizer = Class.extend({

    init: function(diagram, selectionPolicy, scope) {
        this.diagram = diagram;
        this.scope = scope;
        this.selectionPolicy = selectionPolicy;
    },

    start: function() {
        var self = this;

        var delayedUiSelectionSync = function() {
            var selection = self.getDatasetFigureSelection();
            if (self.includesDatasetSelectedInModel(selection)) {
                return;
            }

            var primary = selection.getPrimary();
            if (primary) {
                self.updateModelSelection(primary);
            } else if (selection.getAll().isEmpty()) {
                self.updateModelSelection(null);
            }
        };

        this.diagram.canvas.addSelectionListener({
            onSelectionChanged: function() {
                setTimeout(delayedUiSelectionSync, 5);
            }
        });

        this.scope.$watch("selectedDataset.id", function(selectedDsId) {
            var datasetSelection = self.getDatasetFigureSelection();

            if (selectedDsId) {
                var datasetFigure = self.diagram.getDataset(selectedDsId);
                if (datasetFigure && !datasetSelection.getAll().contains(datasetFigure)) {
                    self.clearUiSelection();
                    self.selectionPolicy.select(self.diagram.canvas, datasetFigure);
                }
            } else {
                self.clearUiSelection();
            }
        });
    },

    clearUiSelection: function() {
        var uiSelection = this.diagram.canvas.getSelection();
        uiSelection.getAll().each(function(i, figure) {
            figure.unselect();
        });
        uiSelection.clear();
    },

    includesDatasetSelectedInModel: function(selection) {
        var selectedDs = this.scope.selectedDataset;
        if (!selectedDs) {
            return;
        }
        var result = false;
        selection.getAll().each(function(i, dsFigure) {
            if (selectedDs.id === dsFigure.model.id) {
                result = true;
            }
        });
        return result;
    },

    getDatasetFigureSelection: function() {
        var selection = this.diagram.canvas.getSelection();
        var datasetSelection = new draw2d.Selection();

        selection.all.each(function(i, obj) {
            if (obj instanceof ldm.diagram.figure.DatasetFigure) {
                datasetSelection.all.add(obj);
            }
        });

        if (selection.getPrimary() instanceof ldm.diagram.figure.DatasetFigure) {
            datasetSelection.setPrimary(selection.getPrimary());
        }
        return datasetSelection;
    },

    updateModelSelection: function(selectedDatasetFigure) {
        var self = this;
        self.diagram.asyncModelUpdate(function() {
            self.diagram.scope.selectDataset(selectedDatasetFigure ? selectedDatasetFigure.model : null);
        });
    }

});