'use strict';

// Define your Application Module module
angular.module('login')
.component('forgotPassword',
{
	templateUrl:'forgotPassword-component/forgotPassword-component.html',
	replace:true,
	controller:forgotPasswordController
})
//$( '#modal_forget' ).dialog( 'open' );
forgotPasswordController.$inject = ['loginStore','loginActions','$scope'];

function forgotPasswordController(loginStore,loginActions,$scope)
{
	var self = this;
	$scope.$listenTo(loginStore, toggleDialog);

	function toggleDialog()
	{
		loginStore.toggleDialog;
	}
}
