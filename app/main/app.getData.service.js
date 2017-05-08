'use strict';
angular.module('phonecatalog')
.factory('getData',getData);

getData.$inject = ['$http','$q'];

function getData($http,$q) 
{
    var self = this;
    self.responseData = ''; 
    self.request = request;

    var service = {
        getPhonesList: getPhonesList,
        getPhoneDetail: getPhoneDetail
    };

    return service;

    function request(path)
    {
       return $http({
                method:'GET',
                url:path,
                cache:true
            }).then(function(response){return response.data;})
            .catch(function(error){alert("Error loading file, "+error.status+" "+error.statusText+". Please check your internet connection...");});
    };

    function getPhonesList() 
    {
       var path = "application-data/phones/phones.json";
       return request(path);
    };

    function getPhoneDetail(phoneId)
    {
        var path = "application-data/phones/"+phoneId+".json";
        return request(path).then(function(response){return response});
    };
}