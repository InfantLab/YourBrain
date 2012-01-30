/**
 * A little bit of script to add the context dependent menus
 * to the current active window
 * @author caspar
 */

	
//add the menu.
var activity;
var helpMessage;
var winMyData;
var win_myData = require('/win/win_mydata');

exports.setHelpMessage = function(helpString){helpMessage = helpString;};

//show the settings tabs
exports.showSettingsScreen = function(){		
	if (!winMyData ){
		winMyData = win_myData.createApplicationWindow();
	}
	winMyData.open();
};

exports.setHelpContext = function(currentActivity){
	activity = currentActivity;
//	win = Ti.UI.currentWindow;
	Ti.API.debug('setHelpContext var activity ' + activity);
	
	activity.onCreateOptionsMenu = function( event ) {
		Ti.API.debug('win_main activity.onCreateOptionsMenu fired');
		  var menu = event.menu
		    , menuAbout = menu.add({ title: 'About' })
		    , menuLegal = menu.add({ title: 'Legal' })
		    , menuSettings = menu.add({ title: 'Settings' })
		    , menuHelp = menu.add({ title: 'Help' });
		 
			//About the app.
			menuAbout.addEventListener( 'click', function( event ) {
				// Ti.API.debug( 'About menu item Touched' );
				// if(Ti.Network.online){
			        // //Titanium.Platform.openURL('www.appcelerator.com');
					// Titanium.Platform.openURL('http://www.yourbrainondrugs.net/FAQ');
		        // } else {
		            // var alertDialog = Titanium.UI.createAlertDialog({
		              // title: Titanium.App.name,
		              // message: (Titanium.App.description + '\nCreated by ' + Ti.App.publisher + '\n\nVersion  ' + Ti.App.version),
		              // buttonNames: ['OK']
		            // });
		            // alertDialog.show();
		        // }
				var creditsDialog = require('/ui/creditsDialog');
				creditsDialog.show();
			});
			//legal.
			menuLegal.addEventListener( 'click', function( event ) {
				var disclaimers = ["Warning: It's just a game.", "Warning: Your mileage may vary","Warning: Not dishwasher safe","Warning: May cause drowsiness or irritablity.","This statement is false","Warning: May contain nuts.", "Warning: Not a floatation device","All characters appearing in this work are fictitious. Any resemblance to real persons, living or dead, is purely coincidental."];
			    var alertDialog = Titanium.UI.createAlertDialog({
			      title: Titanium.App.name,
			      message:disclaimers[Math.floor(8*Math.random())] ,
			      buttonNames: ['OK']
			    });
			    alertDialog.show();  
			});
			menuHelp.addEventListener( 'click', function( event ) {
				 var alertDialog = Titanium.UI.createAlertDialog({
		          title: Titanium.App.name,
		          message: helpMessage,
		          buttonNames: ['OK']
		        });
		        alertDialog.show();
			});
			menuSettings.addEventListener( 'click', function( event ) {
			    exports.showSettingsScreen();
			  });		  
		};
};




