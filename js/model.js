angular.module('model', ['ngResource']).
    factory('LdmResource', function($resource) {
        return $resource('http://10.151.1.204:8080:8080/gdc/projects/zgfs16g7iy7hkyeu0kkphblqfynjznw4/ldm/view/EIO5wrE7Igo2vHyvqGnFQlNImWVvXGAj/result');
    });