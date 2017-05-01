'use strict';
angular.module('spell')
.provider('$history',function()
{
	var self = this;
	self.history = [];

	self.$get = ['$route',function($route)
	{
		var $history = {
			
			historyMaintain:function($rootScope)
			{
				$rootScope.$on('$routeChangeSuccess',function(event,current,previous)
				{
					if(current&&current.$$route.originalPath!=$history.getHistory()[$history.getHistory().length-1])
						$history.saveHistory(current.$$route.originalPath);
					$history.logHistory();
				});
			},
		
			saveHistory:function(url){ self.history.push(url); },

			getPreviousPage:function(){ return self.history[self.history.length-1] },

			getHistory:function(){ return self.history; },

			logHistory:function() { console.log(self.history); },

			historySearch:function(url) { var exists = false; self.history.forEach(function(el){if(el===url)exists=true;}); },

			removeLastEntry:function() { self.history=self.history.slice(0,self.history.length-1);}
	
		}
		return $history;
   }];
})