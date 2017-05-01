'use strict';

// Angular E2E Testing Guide:
// https://docs.angularjs.org/guide/e2e-testing

describe('PhoneCat Application', function() {

  it('should redirect `index.html` to `index.html/#!/`', function() {
    browser.get('index.html');                     //Omer taavor leamud lefi File index.html
    expect(browser.getLocationAbsUrl()).toBe('/'); //Be config Function wel Module hayavim lehagdir et ze al yadey $routeProvider.when("/",{redirectTo:"/"})
  });

  describe('View: Phone list', function() {

    beforeEach(function() {
      browser.get('index.html');                   //Lifney kol Test taavor le index.html
    });
	
	//Testing <input> Field
    it('should filter the phone list as a user types into the search box', function() {
      var phoneList = element.all(by.repeater('phone in $ctrl.phones'));    //mekablim et kol haPhones
      var query = element(by.model('$ctrl.searchInput'));				    //Mekablim <input> Field					

      expect(phoneList.count()).toBe(20);                                   //Kwe <input> field rek, ew 20 Elements

      query.sendKeys('dell');											    //Kwewolhim le <input> field 'dell' az zarih lehiyot: 
      expect(phoneList.count()).toBe(2);								    //2 Elements
 
      query.clear();													    //Menakim tohen wel <input> field
      query.sendKeys('motorola');										    //Kwewolhim le <input> field 'motorola' az zarih lehiyot: 	
      expect(phoneList.count()).toBe(8);								    //8 Elements	
    });

	//Testing <select> menu
    it('should be possible to control phone order via the drop-down menu', function() {
      var queryField = element(by.model('$ctrl.searchInput'));			    //Mekablim <input> Field	
      var orderSelect = element(by.model('$ctrl.filter'));				    //Mekablim <select> Tag
      var nameOption = orderSelect.element(by.css('option[value="name"]')); //Bohrim "name" <option> mi <select> Tag
      var phoneNameColumn = element.all(by.repeater('phone in $ctrl.phones').column('phone.name')); //Mekablim Telefonim

      function getNames() {
        return phoneNameColumn.map(function(elem) {                         //Memapim wemot mitoh maarah haze 
          return elem.getText();
        });
      }

      queryField.sendKeys('tablet');   // Let's narrow the dataset to make the assertions shorter

      expect(getNames()).toEqual([                                          //Walahnu le <input> Field 'tablet', 
        'Motorola XOOM\u2122 with Wi-Fi',								    //Mezapim lekabel 2 wemot haele
        'MOTOROLA XOOM\u2122'
      ]);

      nameOption.click();													//Bohrim <option> "name" mitoh <select>

      expect(getNames()).toEqual([											//Seder wemot akwav zarih lehiyot wone
        'MOTOROLA XOOM\u2122',
        'Motorola XOOM\u2122 with Wi-Fi'
      ]);
    });

    it('should render phone specific links', function() {
      var query = element(by.model('$ctrl.searchInput'));
      query.sendKeys('nexus');												//wolhim 'nexus' le<input> Field

      element.all(by.css('.phone-field img')).first().click(); //Get the first() matched Element and Emulate the click() on it
      expect(browser.getLocationAbsUrl()).toBe('/phone-detail/nexus-s');   //mezapim weBrowser yaavor leAmud wel nexus.
    });

  });

  describe('View: Phone detail', function() {

    beforeEach(function() {
      browser.get('index.html#!/phone-detail/nexus-s');                    //Ovrim leamud wel nexus
    });

    it('should display the `nexus-s` page', function() {
      expect(element(by.binding('$ctrl.phoneData.name')).getText()).toBe('Nexus S'); //Bodkim wwem wel Telefon hu 'Nexus S'
    });
	
	it('should display the `nexus-s` page 4 pictures', function() 
	{
      var pics = element.all(by.repeater('image in $ctrl.phoneData.images')); //by.repeater Hayav lehiyot bedyuk kmo beHTML, im ze image - az image, LO img
	  expect(pics.count()).toBe(4); 
	  pics.each(function(element, index) 
	  {
	// Will go threw 0 First, 1 Second, 2 Third.
		expect(element.isDisplayed()).toBe(true);                         //isDisplayed() mahzir TRUE im Element mofia al hamasah
	  });
	});
	
    it('should display the first phone image as the main phone image', function() {
      var mainImage = element(by.css('.phone-image-img'));                //Kwemehapsim Element by CSS, lifney Class Name zarih lehiyot . - .phone-image-img

      expect(mainImage.getAttribute('src')).toMatch(/application-data\/img\/phones\/nexus-s.0.jpg/);//Be toMatch, lifney kol / sami \, veim ze Path, 
    });																							    //Hu gam mathil be / - /application-data

    it('should swap the main image when clicking on a thumbnail image', function() {
      var mainImage = element(by.css('.phone-image-img'));
      var thumbnails = element.all(by.css('.thumbnails img'));

      thumbnails.get(2).click();                                                    //lohzim al thumbnail
      expect(mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.2.jpg/);  //src wel Main Image zarih lehiwtanot velehatim leMatch

      thumbnails.get(0).click();													//lohzim al thumbnail
      expect(mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);	//src wel Main Image zarih lehiwtanot velehatim leMatch
    });
	
	it(' should check there are 8 <phone-content> components and they are "displayed" ', function() {
      var table = element.all(by.css('.phone-contents td'));						//Mekablim maarah Elements lefi Class - .phone-contents <td>
      expect(table.count()).toBe(8);
	  table.each(function(element, index) 
	  {
	// Will go threw 0 First, 1 Second, 2 Third.
		expect(element.isDisplayed()).toBe(true);									//Bodkim wekol <td> mofia al hamasah
	  });
    });

  });

});
