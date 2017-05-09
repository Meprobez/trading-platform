angular.module('login')
.store('loginStore', loginStore);

function loginStore() 
{
  return {
    initialize: function () {
      this.state = this.immutable({
       forgotPassword: false
      });
    },
    handlers: {
      TOGGLE_DIALOG: 'toggleDialog'
    },

    toggleDialog: function (payload) 
    {
      this.state.set('forgotPassword', payload.toggle);
      $( "#modal_forget" ).dialog({
         autoOpen: true,
         modal: true,
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
    },
    exports: {
      get forgotPassword() {
        return this.state.get('forgotPassword');
      }
    }
  }
}