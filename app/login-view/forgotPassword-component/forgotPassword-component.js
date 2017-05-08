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
forgotPasswordController.$inject = ['loginStore','loginActions'];

function forgotPasswordController(loginStore,loginActions)
{
	var self = this;
 
  self.toggleDialog = loginActions.toggleDialog;
  self.$listenTo(loginStore);

  function setStoreVars() {
      $scope.forgotPassword = loginStore.forgotPassword;
    }
}
