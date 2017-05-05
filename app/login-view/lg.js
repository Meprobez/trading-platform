'use strict';

// Define your Application Module module
angular.module('trading-platform')
.component('login',{
	templateUrl:'lg.html',
	transclude:true,
	replace:true,
	controller:loginController
})
//$( '#modal_forget' ).dialog( 'open' );
function loginController()
{
	var self = this;
	self.toggleDialog = toggleDialog;
}

function toggleDialog()
{
	$(function(){
    $( "#modal_forget" ).dialog({
      autoOpen: false,
       modal: true,
       title: "forgot my password",
		buttons: {
        "Send": function() {
			jQuery('#msg_forget_pass').text("Loading");
			jQuery.getJSON("/trade.php/trader/connection/getPassword", {login:jQuery("#inpt_forget_login").val() }, function(data)
            {
				jQuery('#msg_forget_pass').text(data["message"]);
			})
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });
});
}