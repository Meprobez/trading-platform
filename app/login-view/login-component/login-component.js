'use strict';

// Define your Application Module module
angular.module('login')
.component('login',{
	templateUrl:'login-component/login-component.html',
	transclude:true,
	replace:true,
	controller:loginController
})

function loginController()
{
	var self = this;
  self.dialogIsDilplayed = false;
}

function toggleDialog()
{
   self.dialogIsDilplayed = true;
}