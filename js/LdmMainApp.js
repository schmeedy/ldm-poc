$(window).load(function () {
    var diagram = new LdmDiagram("diagram-canvas", "diagram-sematic-model");
    diagram.reload();
});

// main module
var ldmApp = angular.module('ldm', ['deleteButton']).
    config(function($routeProvider) {
        $routeProvider.
            when('/', {controller: DatasetListCtrl, templateUrl: 'views/datasetList.html'}).
            when('/dataset/:datasetId', {controller: DatasetDetailsCtrl, templateUrl: 'views/datasetDetail.html'}).
            when('/dataset/:datasetId/attribute/:attributeId', {controller: AttributeDetailsCtrl, templateUrl: 'views/attributeDetail.html'}).
            when('/dataset/:datasetId/fact/:factId', {controller: FactDetailsCtrl, templateUrl: 'views/factDetail.html'}).
            otherwise({redirectTo: '/'});
    });

// TODO enforce uniqueness
// utility service for sharing common methods
ldmApp.factory('Utils', function() {
    return {
        uuid: function(type, title, datasets) {
            var sections = [type];

            if (!title) {
                throw "title can't be empty in order to generate id";
            }

            if (title.match(/^[a-z][a-z0-9_\\.]*$/)) {
                return sections.concat(title).join(".");
            }

            sections = sections.concat(title.split("."));
            for (var i = 0; i < sections.length; i++) {
                sections[i] = sections[i].replace(/[^a-zA-Z0-9_]/g, "");
                sections[i] = sections[i].replace(/^[0-9_]*/g, "");

            }

            return sections.join(".");
        },

        addDataset: function(scope, datasetTitle) {
            if (!datasetTitle) {
                return;
            }

            var datasetTitles = datasetTitle.split(/[;,]/);
            for (var i = 0; i < datasetTitles.length; i++) {
                var singleDatasetTitle = datasetTitles[i];
                scope.datasets.push({
                    id: this.uuid('dataset', singleDatasetTitle),
                    title: singleDatasetTitle
                });
            }

        }
    };
});


// main controller responsible for the whole app
function MainCtrl($scope, Utils) {
    // mocks
    $scope.datasets = [
        {
            id: "dataset.person",
            title: "Person",
            attributes: [
                {
                    id: "some.attribute1",
                    title: "some attribute 1",
                    connectionPoint: true
                },
                {
                    id: "some.other.attribute",
                    title: "some other attribute"
                }
            ],

            facts: [
                {
                    id: "number.of.brothers",
                    title: "number of brothers"
                },
                {
                    id: "age",
                    title: "age"
                }
            ],
            references: [
                'dataset.department'
            ]
        },
        {
            id: "dataset.department",
            title: "Department",
            references: []
        }
    ];

    // actually selected dataset (selected from canvas or from property editor)
    $scope.selectedDataset = null;


    $scope.addDataset = function(title) {
        Utils.addDataset($scope, title);
        $scope.newDatasetTitle = "";
    };

    $scope.removeDataset = function(dataset) {
        for (var i = 0; i < $scope.datasets.length; i ++) {
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
}
