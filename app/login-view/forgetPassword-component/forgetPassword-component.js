'use strict';

// Define your Application Module module
angular.module('login')
.component('forgetPassword',
{
	templateUrl:'forgetPassword-component/forgetPassword-component.html',
	replace:true,
	controller:forgetPasswordController
})
//$( '#modal_forget' ).dialog( 'open' );
function forgetPasswordController()
{
	var self = this;
	self.toggleDialog = toggleDialog;
}

function toggleDialog()
{
    $( "#modal_forget" ).dialog({
      autoOpen: true,
       modal: true,
       title: "forgot my password",
		buttons: {
        "Send": function() 
        {
		    jQuery('#msg_forget_pass').text("Loading");
			jQuery.getJSON("/trade.php/trader/connection/getPassword", {login:jQuery("#inpt_forget_login").val() }, function(data)
            {
				jQuery('#msg_forget_pass').text(data["message"]);
			})
        },
        Cancel: function() 
        {
          $( this ).dialog( "close" );
        }
      }
    });

}