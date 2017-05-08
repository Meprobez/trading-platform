'use strict';
// Define your Application Module module
angular.module('login')
.component('login',
{
	templateUrl:'login-component/login-component.html',
	transclude:true,
	replace:true,
	controller:loginController
})

loginController.$inject = ['loginActions'];

function loginController(loginActions)
{
	var self = this;
  	self.toggleDialog = toggleDialog;

	function toggleDialog()
	{
		loginActions.toggleDialog();
	}
}