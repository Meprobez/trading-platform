'use strict';
angular.module('spell')
.factory('statesMaintain',function()
{
	var states=[];
	return {
		maintainId:function(id,$routeParams)
		{
			var cutedString = '';
			for(prop in $routeParams)
			{
				cutedString+='/'+$routeParams[prop];
			}
			console.log(cutedString);
			id =id.replace(cutedString,'');
			console.log(id);
			return id;
		},

		saveState:function(name,state) { states[name] = state; },

		getState:function(name) { return states[name]||undefined; },

		removeState:function(name) { state[name] = undefined; },

		getStatesArray:function() { return states;},
			
		logStatesArray:function() { console.log(states); }
 	};
})