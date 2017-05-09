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

loginController.$inject = ['loginStore','loginActions','$scope'];

function loginController(loginStore,loginActions,$scope)
{
	var self = this;
	self.forgotPassword = loginStore.forgotPassword;
	self.toggleDialog = toggleDialog;
	
	self.loginError = loginStore.loginError;

	$scope.$listenTo(loginStore,'forgotPassword',setView);
	$scope.$listenTo(loginStore,'loginError',toggleError);
    	
	function toggleDialog()
	{
		loginActions.toggleDialog();
		loginActions.loginError(false);
	}

	function setView()
	{
		self.forgotPassword = loginStore.forgotPassword;
	}

	function toggleError()
	{
		self.loginError = loginStore.loginError;
		console.log(self.loginError);
	}
}