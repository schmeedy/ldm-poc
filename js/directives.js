angular.module('deleteButton', []).directive('buttonDelete', function($compile, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        template: '<a href="" class="button-delete"><i style="margin-top: 4px;" class="icon-remove"></i></a>',
        link: function(scope, element, attrs) {
            element.clickover({
                placement: 'bottom',
                global: true,
                html: true,
                title: 'Action confirmation',
                content: "<div id='popup'><p>" + attrs.body + "</p><button id='button-confirm-delete-cancel' data-dismiss='clickover' class='btn'>Cancel</button><button id='button-confirm-delete-ok' class='btn btn-danger' ng-click='" + attrs.fn + "'>Delete</button></div>"
            }).on('shown', function() {
                    $compile($("#popup").contents())(scope);
                });
        }
    };
});

angular.module('buttonsRadio', []).directive('buttonsRadio', function() {
    return {
        restrict: 'E',
        scope: { model: '=', options: '='},
        controller: function($scope) {
            $scope.activate = function(option) {
                $scope.model = option;
            };
        },
        template: "<button type='button' class='btn' " +
            "ng-class='{active: option.value == model}'" +
            "ng-repeat='option in options' " +
            "ng-click='activate(option.value)'>{{option.title}} " +
            "</button>"
    };
});
