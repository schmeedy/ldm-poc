function MainCtrl($scope) {
    $scope.datasets = [
        {
            id: "dataset.person",
            title: "Person",
            attributes: [
                {
                    id: "some.attribute1",
                    title: "some attribute 1"
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
            ]
        },
        {
            id: "dataset.department",
            title: "Department" }
    ];

    $scope.selectedDataset = null;

    function uuid() {
        return 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    $scope.addDataset = function(title) {
        if (!title) {
            return;
        }

        $scope.newDatasetTitle = "";
        $scope.datasets.push({
            id: "dataset." + uuid(),
            title: title
        });
    }
}
