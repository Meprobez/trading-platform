'use strict';

// Angular E2E Testing Guide:
// https://docs.angularjs.org/guide/e2e-testing

 describe('trading-platform', function() {

  it('should redirect `login.html` to `login.html/#!/`', function() {
    browser.get('/');                     //Omer taavor leamud lefi File index.html
    expect(browser.getLocationAbsUrl()).toBe('/'); //Be config Function wel Module hayavim lehagdir et ze al yadey $routeProvider.when("/",{redirectTo:"/"})
  });

  describe('View: login-view', function() {

    beforeEach(function() {
      browser.get('/');                   //Lifney kol Test taavor le index.html
       });
    
    it('should redirect `login.html` to `login.html/#!/trade.php/trader/connection/formGetPassword`', function() {  
      var element = browser.findElement(by.id('forget'));
      element.click();
      expect(browser.getLocationAbsUrl()).toBe('/#/trade.php/trader/connection/formGetPassword');
   

    });
 });
});