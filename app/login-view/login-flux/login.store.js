angular.module('login')
.store('loginStore', loginStore);

loginStore.$inject = ['$location'];
function loginStore($location) 
{
  return {
    initialize: function () {
      this.state = this.immutable({
       forgotPassword: false,
       loginError: false
      });
    },
    handlers: {
      TOGGLE_DIALOG: 'toggleDialog',
      TOGGLE_LOGIN_ERROR: 'toggleLoginError'
    },

    toggleDialog: function (payload) 
    {
      this.state.set('forgotPassword', payload.toggle);
      $( "#modal_forget" ).dialog({
         autoOpen: true,
         title:'I forgot my password',
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
                      window.location = '/trade.php/trader/connection/login';
                      $( this ).dialog( "close" );
                      
                    }
                  }
      });
    },
    toggleLoginError:function(payload)
    {
      this.state.set('loginError', payload.error);
    },
    exports: {
      get forgotPassword() {
        return this.state.get('forgotPassword');
      },
      get loginError() {
        return this.state.get('loginError');
      }
    }
  }
}