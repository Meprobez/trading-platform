'use strict';

// Define your Application Module module
angular.module('login', [
  'ngAnimate',
  'ngRoute',
  'ui.router',
  'spell',
  'flux'
])
.config(config);

config.$inject = ['$provide','$compileProvider','$filterProvider','$routeProvider','$locationProvider','moduleInvokerProvider','$httpProvider','$sceDelegateProvider','$stateProvider','fluxProvider','loginActionsProvider'];

function config($provide,$compileProvider,$filterProvider,$routeProvider,$locationProvider,moduleInvokerProvider,$httpProvider,$sceDelegateProvider,$stateProvider,fluxProvider,loginActionsProvider)
{
  var forgotPassword = {
  name: 'forgotPassword',
  parent: 'login',
  url: '/forgotPassword',
  component: 'forgotPassword'
  };

  $stateProvider.state(forgotPassword);
  
  console.log(angular.module('login'));
}
