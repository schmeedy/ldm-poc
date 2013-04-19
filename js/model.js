// angular bug, https://github.com/angular/angular.js/issues/1243 (double port)
angular.module('model', ['ngResource']).
    factory('LdmMainResource',function($resource) {
        return $resource('http://10.151.1.204:8080:8080/gdc/projects/:projectId/webldm');
    }).factory('LdmPollResource',function($resource) {
        return $resource('http://10.151.1.204:8080:8080/gdc/projects/:projectId/webldm/view/:taskId');
    }).factory('LdmResultResource', function($resource) {
        return $resource('http://10.151.1.204:8080:8080/gdc/projects/:projectId/webldm/view/:taskId/result');
    });