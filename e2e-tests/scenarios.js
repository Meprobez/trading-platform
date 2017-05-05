'use strict';

// Angular E2E Testing Guide:
// https://docs.angularjs.org/guide/e2e-testing
describe('trading-platform', function() 
{
  describe('View: login-view', function() 
  {
    beforeEach(function() 
    {
      browser.ignoreSynchronization = true;             //Disabling waiting for Angular for non-Angular web pages
      browser.get('http://localhost:8080/');            //Before Test get login.html
    });

    it('should check text of forgot_password dialog Toggle window and verify that it is displayed', function() 
    {  
      var forget = browser.findElement(by.id('forget'));
      expect(forget.getText()).toBe('I forgot my password');
      forget.click();
      var modal_forget = element(by.id('modal_forget'));
      expect(modal_forget.isDisplayed()).toBe(true);
     });
    
    it('should toggle dialog window and redirect `http://localhost:8080/` to `http://localhost:8080//#!/trade.php/trader/connection/formGetPassword`', function() 
    {  
      var forget = browser.findElement(by.id('forget'));
      forget.click();
      var modal_forget = element(by.id('modal_forget'));
      expect(modal_forget.isDisplayed()).toBe(true);
      expect(browser.getCurrentUrl()).toBe('http://localhost:8080/#/trade.php/trader/connection/formGetPassword');
     });
    
    it('should toggle dialog window, drag and drop it and verify the display of `This email does not exist in our database` message', function() 
    {  
      var forget = browser.findElement(by.id('forget'));
      forget.click();
      var ui_id_1 = element(by.cssContainingText('.ui-dialog-title', 'forgot my password'));

      var EC = protractor.ExpectedConditions;
      // Waits for the element with 'some' id to contain the 'some' text.
      browser.wait(EC.textToBePresentInElement(ui_id_1, 'forgot my password'), 5000);
      browser.actions().dragAndDrop(ui_id_1,{x: -300, y: -300}).perform();
     
      var inpt_forget_login = browser.findElement(by.id('inpt_forget_login'));
      inpt_forget_login.sendKeys('victorz@airsoftltd.com');
      
      var send = browser.findElement(by.buttonText('Send'));
      send.click();  
      
      //browser.sleep(3000);
      var EC = protractor.ExpectedConditions;
      // Waits for the element with 'some' id to contain the 'some' text.
      browser.wait(EC.textToBePresentInElement($('#msg_forget_pass'), 'This email does not exist in our database'), 5000);
      
     
      var msg_forget_pass = browser.findElement(by.id('msg_forget_pass'));
      expect(msg_forget_pass.getText()).toBe('This email does not exist in our database');
      
      var cancel = browser.findElement(by.buttonText('Cancel'));
      browser.actions().mouseMove(cancel).mouseDown(cancel).mouseUp().perform();
      
    });
    it('should Log user in, and Url is to be http://localhost:8080/trade.php/trader/', function() 
    {  
      var email = browser.findElement(by.id('email'));
      email.sendKeys('victorz@airsoftltd.com');

      var password = browser.findElement(by.id('password'));
      password.sendKeys('player2');

      var go = browser.findElement(by.id('go'));

      go.click();
      expect(browser.getCurrentUrl()).toBe('http://localhost:8080/trade.php/trader/');
    });
  });
});