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

// utility service for sharing common methods
ldmApp.factory('Utils', function() {
    return {
        uuid: function(type, title) {
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
            title: "Department" }
    ];

    // actually selected dataset (selected from canvas or from property editor)
    $scope.selectedDataset = null;


    $scope.addDataset = function(title) {
        if (!title) {
            return;
        }

        $scope.datasets.push({
            id: Utils.uuid('dataset', title),
            title: title
        });

        $scope.newDatasetTitle = "";
    };
}
