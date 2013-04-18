function MainCtrl($scope) {
    $scope.datasets = [
        { id: "dataset.person", title: "Person" },
        { id: "dataset.department", title: "Department" }
    ];

    function uuid() {
        return 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    $scope.addDataset = function(title) {
        $scope.newDatasetTitle = "";
        $scope.datasets.push({
            id: "dataset." + uuid(),
            title: title
        });
    }
}
