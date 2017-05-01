'use strict';

// Define your Application Module module
angular.module('', [
  'ngAnimate',
  'ngRoute',
  'ui.router',
  'spell',
])
.config(config);

config.$inject = ['$provide','$compileProvider','$filterProvider','$routeProvider','$locationProvider','moduleInvokerProvider','$httpProvider','$sceDelegateProvider','$stateProvider'];

function config($provide,$compileProvider,$filterProvider,$routeProvider,$locationProvider,moduleInvokerProvider,$httpProvider,$sceDelegateProvider,$stateProvider)
{
	moduleInvokerProvider.getProviders(arguments);
	$compileProvider.preAssignBindingsEnabled(true);
	$routeProvider.eagerInstantiationEnabled(false)
	// Check if a new cache is available on page load.
	window.addEventListener('load', function(e) 
	{
		window.applicationCache.addEventListener('updateready', function(e) 
		{
    		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) 
    		{
      			// Browser downloaded a new app cache.
      			if (confirm('A new version of this site is available. Load it?')) {
      				alert('The new Manifest is loading');
      				window.applicationCache.update();
        			window.location.reload();
      		}
    	} 
    	else { } // Manifest didn't changed. Nothing new to server. 
    }, false);

}, false);
	$locationProvider.hashPrefix('!');
	$sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow JSONP calls that match this pattern
    'https://some.dataserver.com/**.jsonp?**'
  ]);
  
  $routeProvider.when('/',{redirectTo: "/"}); //aheret localhost:port yiten wgiya, vekaha ze yaavor le localhost:port/#!/
}
