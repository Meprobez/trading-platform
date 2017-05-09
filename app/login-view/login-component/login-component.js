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

loginController.$inject = ['loginStore','loginActions','$scope','$http'];

function loginController(loginStore,loginActions,$scope,$http)
{
	var self = this;
	self.forgotPassword = loginStore.forgotPassword;
	self.toggleDialog = toggleDialog;
  	
	self.$postLink = postLink;
	self.errorPassword = false;

	$scope.$listenTo(loginStore,setView);

	function toggleDialog()
	{
		loginActions.toggleDialog();
	}

	function setView()
	{
		self.forgotPassword = loginStore.forgotPassword;
	}

	function postLink()
	{
		window.addEventListener('load',function(event)
		{
			alert(event);
			console.log(event);
			self.errorPassword = true;
		})
	}

}