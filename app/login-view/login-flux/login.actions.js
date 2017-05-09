angular.module('login')
.factory('loginActions', loginActions);

loginActions.$inject = ['$http','flux'];

function loginActions($http, flux) 
{
  var service = {
    toggleDialog: toggleDialog,
    loginError:loginError
  };
  return service;

  function toggleDialog() 
  {
    flux.dispatch('TOGGLE_DIALOG',{toggle:true});
  }
  function loginError(error) 
  {
    flux.dispatch('TOGGLE_LOGIN_ERROR',{error:error});
  }

}
  // An exaple of a basic dispatch with the first argument being the action key and a payload.
  // One or more stores is expected to have a handler for COMMENT_SET_TITLE
  

  // It is not recommended to run async operations in your store handlers. The
  // reason is that you would have a harder time testing and the **waitFor**
  // method also requires the handlers to be synchronous. You solve this by having
  // async services, also called **action creators** or **API adapters**.
 /* function addComment(comment) {
    flux.dispatch('COMMENT_ADD', { comment: comment });
    $http.post('/comments', comment)
    .then(function () {
      flux.dispatch('COMMENT_ADD_SUCCESS', { comment: comment });
    })
    .catch(function (error) {
      flux.dispatch('COMMENT_ADD_ERROR', { comment: comment, error: error });
    });
  }*/
