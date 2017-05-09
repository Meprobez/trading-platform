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
  
  $routeProvider.when('/',{redirectTo: "/trade.php/trader/connection/login"}) //aheret localhost:port yiten wgiya, vekaha ze yaavor le localhost:port/#!/
                .when('/trade.php/trader/connection/out',{resolve:{ togglePasswordError:togglePasswordError}});
                 
  var login = {
    name: 'login',
    url: '/trade.php/trader/connection/login',
    sticky: true,
    component:'login'
  };

  $stateProvider.state(login);
 
  togglePasswordError.$inject = ['loginStore', 'loginActions','$location'];
  function togglePasswordError(loginStore,loginActions,$location)
  {
    loginActions.loginError(true);
    $location.path('/trade.php/trader/connection/login');
  }
  console.log(angular.module('trading-platform'));
}
