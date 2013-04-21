function DatasetListCtrl($scope, Utils) {
    $scope.$parent.selectedDataset = null;

    $scope.newDatasetTypeFromEditor = "dataset";

    $scope.remove = function(dataset) {
        $scope.removeDataset(dataset);
    };

    $scope.addDataset = function(title, type) {
        Utils.addDataset($scope.datasets, title, type);
        $scope.newDatasetTitleFromEditor = "";
    };
}

function DatasetDetailsCtrl($scope, $routeParams, Utils) {
    $scope.$parent.selectedDataset = findDatasetById($scope.datasets, $routeParams.datasetId);


    $scope.fieldTypes = [
        {
            value: 'attribute',
            title: 'Attr'
        },
        {
            value: 'fact',
            title: 'Fact'
        }
    ];

    $scope.fieldType = $scope.fieldTypes[0].value;


    $scope.removeAttribute = function(attribute) {
        var index = $scope.selectedDataset.attributes.indexOf(attribute);
        if (index >= 0) {
            $scope.selectedDataset.attributes.splice(index, 1);
        }
    };

    $scope.removeReference = function(referenceId) {
        var index = $scope.selectedDataset.references.indexOf(referenceId);
        if (index >= 0) {
            $scope.selectedDataset.references.splice(index, 1);
        }
    };

    $scope.removeFact = function(fact) {
        var index = $scope.selectedDataset.facts.indexOf(fact);
        if (index >= 0) {
            $scope.selectedDataset.facts.splice(index, 1);
        }
    };

    $scope.addField = function(title, type) {
        if (!title || !type) {
            return;
        }

        Utils.addFieldToDataset($scope.datasets, $scope.selectedDataset, title, type);
        $scope.newTitle = '';
    };

    $scope.setConnectionPoint = function(attribute) {
        Utils.setConnectionPoint($scope.selectedDataset, attribute);
    };
}


function AttributeDetailsCtrl($scope, $location, $routeParams, Utils) {
    if (!$scope.selectedDataset) {
        $scope.$parent.selectedDataset = findDatasetById($scope.datasets, $routeParams.datasetId);
    }

    $scope.attribute = findInDatasetById($scope.selectedDataset, 'attributes', $routeParams.attributeId);
    if (!$scope.attribute) {
        $location.path("/dataset/" + $scope.selectedDataset.id);
    }


    $scope.addLabelToAttribute = function(labelTitle, attribute) {
        Utils.addLabelToAttribute($scope.datasets, attribute, labelTitle);
        $scope.newLabelTitle = '';
    };

    $scope.removeLabelFromAttribute = function(label, attribute) {
        var index = attribute.labels.indexOf(label);
        if (index >= 0) {
            attribute.labels.splice(index, 1);
        }
    };

    $scope.setConnectionPoint = function(isConnectionPoint) {
        if (isConnectionPoint) {
            Utils.setConnectionPoint($scope.selectedDataset, $scope.attribute);
        } else {
            $scope.attribute.connectionPoint = false;
        }
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