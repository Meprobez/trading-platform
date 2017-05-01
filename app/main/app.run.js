'use strict';
angular.module('')
.run(['$rootScope','$history',function($rootScope,$history)
{
	$history.historyMaintain($rootScope);
		
}])
