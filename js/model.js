angular.module('model', ['ngResource']).
    factory('LdmResource', function($resource) {

        // angular bug, https://github.com/angular/angular.js/issues/1243 (double port)
        return $resource('http://10.151.1.204:8080:8080/gdc/projects/zgfs16g7iy7hkyeu0kkphblqfynjznw4/ldm/view/EIO5wrE7Igo2vHyvqGnFQlNImWVvXGAj/result');
    });