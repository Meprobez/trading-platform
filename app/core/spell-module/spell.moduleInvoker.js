'use strict';
angular.module('spell')
.provider('moduleInvoker',function()
{
	var self = this;
	self.providers = [];

	self.getProviders = function(args)
	{
		for(var i = 0;i<args.length;i++)
		{
			if('provider' in args[i])
				self.providers['$provide'] = args[i];
			if('component' in args[i]) 
				self.providers['$compileProvider'] = args[i];
			if('register' in args[i]) 
				self.providers['$filterProvider'] = args[i];
			if('when' in args[i]) 
				self.providers['$routeProvider'] = args[i];
			if('html5Mode' in args[i]) 
				self.providers['$locationProvider'] = args[i];
		    if('state' in args[i])
		    	self.providers['$stateProvider'] = args[i];
		}
	};

	self.$get = ['$http','$route','$location','$history',function($http,$route,$location,$history)
	{
		var providers = self.providers;

		var that = this;
		
		that.loadedModules = [];
		
		that.invokeModule = function(element)
		{
			console.log(element);
			switch(element[1])
				{
					case 'factory': providers.$provide.factory(element[2][0],element[2][1]);
					break;

					case 'service': providers.$provide.service(element[2][0],element[2][1]);
					break;

					case 'provider': providers.$provide.provider(element[2][0],element[2][1]);
					break;
	
					case 'component': providers.$compileProvider.component(element[2][0],element[2][1]);
					break;

					case 'directive': providers.$compileProvider.directive(element[2][0],element[2][1]);
					break;

					case 'filter': providers.$filterProvider.register(element[2][0],element[2][1]);
					break;
				}
		};

		that.logModule = function(module)
		{
			console.log("Module: ",module.name,"==>");
			console.log(module);
		};
		
		return {

			providers:self.providers,
			
			loadedModules:that.loadedModules,

			loadModule:function(path)
			{
				$http(
				{
				  	url:path,
				  	method: 'GET',
				  	cache:true,
				  	transformResponse:[]
			 	}).then(function(response)
	  			{
					var module = eval(response.data);
					that.loadedModules[module.name+", "+module._invokeQueue[module._invokeQueue.length-1][2][0]] = module;
					 		
					that.invokeModule(module._invokeQueue.pop());
					  	
				   	$route.reload();
					$location.replace();

				}).catch(function(error)
				{
					alert("Error loading module, "+error.status+" "+error.statusText+". Redirecting...");
					$history.removeLastEntry();
					if($history.getHistory().length<3)
						$location.path('/');
					else
						window.location = "#!"+$history.getPreviousPage();
					  		 	 	
					$location.replace();
	      		});
			}  
		};
	}];
})