"use strict";

/*User forgot password dialog box*/

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
