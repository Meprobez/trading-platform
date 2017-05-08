'use strict';

// Define your Application Module module
angular.module('login', [
  'ngAnimate',
  'ngRoute',
  'ui.router',
  'spell',
])
.config(config);

config.$inject = ['$provide','$compileProvider','$filterProvider','$routeProvider','$locationProvider','moduleInvokerProvider','$httpProvider','$sceDelegateProvider','$stateProvider'];

function config($provide,$compileProvider,$filterProvider,$routeProvider,$locationProvider,moduleInvokerProvider,$httpProvider,$sceDelegateProvider,$stateProvider)
{
  console.log(angular.module('login'));
}
