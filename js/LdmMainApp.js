// initialize root namespace
var ldm = {
    diagram: {
        figure: {}
    }
};

$(window).load(function() {
    var diagram = new ldm.diagram.LdmDiagram("diagram-canvas", "zoom-toolbar", "diagram-sematic-model");
    diagram.reload();
});

// main module
var ldmApp = angular.module('ldm', ['deleteButton', 'buttonsRadio', 'model']).
    config(function($routeProvider) {
        $routeProvider.
            when('/', {controller: DatasetListCtrl, templateUrl: 'views/datasetList.html'}).
            when('/dataset/:datasetId', {controller: DatasetDetailsCtrl, templateUrl: 'views/datasetDetail.html'}).
            when('/dataset/:datasetId/attribute/:attributeId', {controller: AttributeDetailsCtrl, templateUrl: 'views/attributeDetail.html'}).
            when('/dataset/:datasetId/fact/:factId', {controller: FactDetailsCtrl, templateUrl: 'views/factDetail.html'}).
            otherwise({redirectTo: '/'});
    });

// utility service for sharing common methods
ldmApp.factory('Utils', function() {
    return {

        // generate id for given type (dataset/attribute,...) and item title; id is unique across
        uuid: function(type, title, datasets) {
            var sections = [type];

            if (!title) {
                throw "title can't be empty in order to generate id";
            }

            if (title.match(/^[a-z][a-z0-9_\\.]*$/)) {
                return this.makeUnique(sections.concat(title).join("."), datasets);
            }

            sections = sections.concat(title.split("."));
            for (var i = 0; i < sections.length; i++) {
                sections[i] = sections[i].replace(/[^a-zA-Z0-9_]/g, "");
                sections[i] = sections[i].replace(/^[0-9_]*/g, "");
            }

            return this.makeUnique(sections.join("."), datasets);

        },

        // ensure id is unique, if not, append index
        makeUnique: function(id, datasets) {
            var incrementalId = id,
                index = 1;

            while (!this.isUnique(incrementalId, datasets)) {
                incrementalId = id + index++;
            }

            return incrementalId;
        },

        // return whether id is unique
        isUnique: function(id, datasets) {
            var i, j;

            for (i = 0; i < datasets.length; i++) {
                if (datasets[i].id === id) {
                    return false;
                }

                if (datasets[i].facts) {
                    for (j = 0; j < datasets[i].facts.length; j++) {
                        if (datasets[i].facts[j].id === id) {
                            return false;
                        }
                    }
                }

                if (datasets[i].attributes) {
                    for (j = 0; j < datasets[i].attributes.length; j++) {
                        if (datasets[i].attributes[j].id === id) {
                            return false;
                        }
                    }
                }
            }
            return true;
        },

        // insert dataset with given into model, unique id is generated automatically
        addDataset: function(allDatasets, datasetTitle) {
            if (!datasetTitle) {
                return;
            }

            var datasetTitles = datasetTitle.split(/[;,]/);
            for (var i = 0; i < datasetTitles.length; i++) {
                var singleDatasetTitle = datasetTitles[i];
                allDatasets.push({
                    id: this.uuid('dataset', singleDatasetTitle, allDatasets),
                    title: singleDatasetTitle
                });
            }
        },

        // add field (fact/attribute) to the dataset; unique id of field is generated automatically
        addFieldToDataset: function(allDatasets, dataset, fieldTitle, fieldType) {
            var titles, singleTitle, fieldsPropertyName;

            if (!fieldTitle || !fieldType) {
                return;
            }

            switch (fieldType) {
                case 'attribute':
                    fieldsPropertyName = 'attributes';
                    break;
                case 'fact':
                    fieldsPropertyName = 'facts';
                    break;
                default:
                    throw "Unknown field type: " + fieldType;
            }

            titles = fieldTitle.split(/[;,]/);
            for (var i = 0; i < titles.length; i++) {
                singleTitle = titles[i];
                if (!dataset[fieldsPropertyName]) {
                    dataset[fieldsPropertyName] = [];
                }

                dataset[fieldsPropertyName].push({
                    id: this.uuid(fieldType, singleTitle, allDatasets),
                    title: singleTitle
                });
            }
        }
    };
});


// main controller responsible for the whole app
function MainCtrl($scope, Utils, LdmResource) {

    $scope.datasets = [];

    $scope.datasets = mock.ldm.model.objects;
//    LdmResource.get({}, function(data) {
//        $scope.datasets = data.ldm.model.datasets;
//        $scope.project = {
//            id: data.ldm.links.project.replace("/gdc/projects/", ""),
//            title: data.ldm.projectMeta.title
//        };
//    });


    // actually selected dataset (selected from canvas or from property editor)
    $scope.selectedDataset = null;


    $scope.addDataset = function(title) {
        Utils.addDataset($scope.datasets, title);
        $scope.newDatasetTitle = "";
    };

    $scope.removeDataset = function(dataset) {
        for (var i = 0; i < $scope.datasets.length; i++) {
            var ds = $scope.datasets[i];
            if (ds.id === dataset.id) {
                $scope.datasets.splice(i, 1);
            } else if (ds.references) {
                // remove reference to the removed dataset
                var index = $.inArray(dataset.id, ds.references);
                if (index >= 0) {
                    ds.references.splice(index, 1);
                }
            }
        }
    };

	$scope.selectDataset = function(dataset) {
        if ((!$scope.selectedDataset && !dataset) ||
            $scope.selectedDataset && dataset && ($scope.selectedDataset.id === dataset.id)) {
            return;
        }
        if (dataset) {
            $location.path("/dataset/" + dataset.id);
        } else {
            $location.path("/");
        }
    };
}
