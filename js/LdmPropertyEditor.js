angular.module('ldm', []).
    config(function($routeProvider) {
        $routeProvider.
            when('/', {controller: DatasetListCtrl, templateUrl: 'views/datasetList.html'}).
            when('/edit/:datasetId', {controller: EditDatasetCtrl, templateUrl: 'views/datasetDetail.html'}).
            otherwise({redirectTo: '/'});
    });


function DatasetListCtrl($scope) {
}

function MainCtrl($scope) {
    $scope.datasets = [
        { id: "dataset.person", title: "Person" },
        { id: "dataset.department", title: "Department" }
    ];
}

function EditDatasetCtrl($scope, $location, $routeParams, Project) {
    var self = this;

    Project.get({id: $routeParams.projectId}, function(project) {
        self.original = project;
        $scope.project = new Project(self.original);
    });

    $scope.isClean = function() {
        return angular.equals(self.original, $scope.project);
    }

    $scope.destroy = function() {
        self.original.destroy(function() {
            $location.path('/list');
        });
    };

    $scope.save = function() {
        $scope.project.update(function() {
            $location.path('/');
        });
    };
}