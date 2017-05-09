'use strict';

// Define your Application Module module
angular.module('trading-platform', [
  'ngAnimate',
  'ngRoute',
  'ui.router',
  'spell',
  'flux',
  'login'
])
.config(config);

config.$inject = ['$provide','$compileProvider','$filterProvider','$routeProvider','$locationProvider','moduleInvokerProvider','$httpProvider','$sceDelegateProvider','$stateProvider','fluxProvider'];

function config($provide,$compileProvider,$filterProvider,$routeProvider,$locationProvider,moduleInvokerProvider,$httpProvider,$sceDelegateProvider,$stateProvider,fluxProvider)
{
	moduleInvokerProvider.getProviders(arguments);
	$compileProvider.preAssignBindingsEnabled(true);
	$routeProvider.eagerInstantiationEnabled(false)
	
	$locationProvider.html5Mode(true).hashPrefix('!');
	$sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow JSONP calls that match this pattern
    'http://devsharewallet.airsoftltd.com/**.jsonp?**'
  ]);
  
  $routeProvider.when('/',{redirectTo: "/trade.php/trader/connection/login"}); //aheret localhost:port yiten wgiya, vekaha ze yaavor le localhost:port/#!/
                
  var login = {
    name: 'login',
    url: '/trade.php/trader/connection/login',
    sticky: true,
    component:'login'
  };

  $stateProvider.state(login);
 
  console.log(angular.module('trading-platform'));
}
