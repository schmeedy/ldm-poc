angular.module('ldm', ['deleteButton']).
    config(function($routeProvider) {
        $routeProvider.
            when('/', {controller: DatasetListCtrl, templateUrl: 'views/datasetList.html'}).
            when('/dataset/:datasetId', {controller: DatasetDetailsCtrl, templateUrl: 'views/datasetDetail.html'}).
            when('/dataset/:datasetId/attribute/:attributeId', {controller: AttributeDetailsCtrl, templateUrl: 'views/attributeDetail.html'}).
            when('/dataset/:datasetId/fact/:factId', {controller: FactDetailsCtrl, templateUrl: 'views/factDetail.html'}).
            otherwise({redirectTo: '/'});
    });


function DatasetListCtrl($scope) {
    $scope.remove = function(dataset) {
        var index = $scope.datasets.indexOf(dataset);
        if (index >= 0) {
            $scope.datasets.splice(index, 1);
        }
    };
}

function DatasetDetailsCtrl($scope, $routeParams) {
    $scope.$parent.selectedDataset = findDatasetById($scope.datasets, $routeParams.datasetId);

    $scope.removeAttribute = function(attribute) {
        var index = $scope.selectedDataset.attributes.indexOf(attribute);
        if (index >= 0) {
            $scope.selectedDataset.attributes.splice(index, 1);
        }
    };

    $scope.removeFact = function(fact) {
        var index = $scope.selectedDataset.facts.indexOf(fact);
        if (index >= 0) {
            $scope.selectedDataset.facts.splice(index, 1);
        }
    };
}


function AttributeDetailsCtrl($scope, $location, $routeParams) {
    var self = this;

    if (!$scope.selectedDataset) {
        $scope.$parent.selectedDataset = findDatasetById($scope.datasets, $routeParams.datasetId);
    }

    $scope.attribute = findInDatasetById($scope.selectedDataset, 'attributes', $routeParams.attributeId);


    $scope.isClean = function() {
//        return angular.equals(self.original, $scope.project);
        return true;
    };

    // todo remove attribuge
    $scope.destroy = function() {
        self.original.destroy(function() {
            $location.path('/dataset/' + self.$scope.selectedDataset.id);
        });
    };

    $scope.save = function() {
        $scope.project.update(function() {
            $location.path('/');
        });
    };
}

function FactDetailsCtrl($scope, $location, $routeParams) {
    var self = this;

    if (!$scope.selectedDataset) {
        $scope.$parent.selectedDataset = findDatasetById($scope.datasets, $routeParams.datasetId);
    }

    $scope.fact = findInDatasetById($scope.selectedDataset, 'facts', $routeParams.factId);


    $scope.isClean = function() {
//        return angular.equals(self.original, $scope.project);
        return true;
    };

    // todo remove attribuge
    $scope.destroy = function() {
        self.original.destroy(function() {
            $location.path('/dataset/' + self.$scope.selectedDataset.id);
        });
    };

    $scope.save = function() {
        $scope.project.update(function() {
            $location.path('/');
        });
    };
}

function findDatasetById(datasets, datasetId) {

    if (!datasets) {
        return null;
    }

    // better array looping ?
    for (var i = 0; i < datasets.length; i++) {
        if (datasets[i].id === datasetId) {
            return datasets[i];
        }
    }
    return null;
}

function findInDatasetById(dataset, propertyType, attributeId) {
    var attributes;

    if (!dataset || !dataset[propertyType]) {
        return null;
    }

    attributes = dataset[propertyType];

    // better array looping ?
    for (var i = 0; i < dataset[propertyType].length; i++) {
        if (attributes[i].id === attributeId) {
            return attributes[i];
        }
    }
    return null;
}