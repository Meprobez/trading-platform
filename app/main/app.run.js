'use strict';
angular.module('trading-platform')
.run(['$rootScope','$history',function($rootScope,$history)
{
	$history.historyMaintain($rootScope);
		
}])
