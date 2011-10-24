/**
 * @author Caspar Addyman
 * 
 * Boozerlyzer application from YourBrainonDrugs.net.
 * This application tracks your drinking, records your mood
 * and has various games that test your psychological and 
 * emotional state while drunk or sober. 
 * 
 * We're trying to wrap all the code in custom constructors to
 * protect the global scope. But I've never coded like this before so
 * I will might do something wrong or horrendously inefficient/inelegant.
 * Sorry!
 * 
 * Copyright yourbrainondrugs.net 2011
 */

Ti.API.debug('app main 0');
//application namespace
var Boozerlyzer = {};
Boozerlyzer.win = {};	//windows
Boozerlyzer.db ={};		//database access functions
Boozerlyzer.comm = {};	//network communication functions
Boozerlyzer.analysis = {};//functions that calculate stuff

//cached data objects
Boozerlyzer.data ={};	
Boozerlyzer.data.AllDrinks = null;//array of drinks
Boozerlyzer.data.personalInfo = null;//demographic info for this participant
Boozerlyzer.data.standardDrinks = null; //standard drink sizes per country
Boozerlyzer.data.currentEmotions = null; //what are current levels of happiness/energy/drunkeness 

Ti.include('/analysis/bloodalcohol.js');
Ti.include('/analysis/maths.js');
//all of the data handling routines.
Ti.include('/db/sessions.js');
Ti.include('/db/doseageLog.js');
Ti.include('/db/alcoholStandardUnits.js');
Ti.include('/db/drugDoses.js');
Ti.include('/db/emotionWords.js');
Ti.include('/db/gameScores.js');
Ti.include('/db/personalInfo.js');
Ti.include('/db/pissonyms.js');
Ti.include('/db/selfAssessment.js');
Ti.include('/db/tripReports.js');
Ti.include('/db/weFeelFine.js');
//helper functions
Ti.include('/js/dateTimeHelpers.js');
//the scripts that communicate with server
Ti.include('/comm/ybodnet.js');
Ti.include('/comm/sendData.js');
Ti.include('/comm/exportData.js');
	
	
Ti.include('/win/win.js'); 
Boozerlyzer.winHome = Boozerlyzer.win.main.createApplicationWindow();
	
var registrationNag = Titanium.App.Properties.getInt('RegistrationNag', 0);
if (registrationNag < 0){
	//launch main app
	Boozerlyzer.winHome.open();	
}else if (registrationNag === 0){
	Boozerlyzer.tabMyData = Boozerlyzer.win.myData.createApplicationWindow("Welcome");
	//Boozerlyzer.tabMyData.open();
}else{
	//we will nag them eventually.
	Titanium.App.Properties.setInt('RegistrationNag', registrationNag - 1);
	//launch main app
	Boozerlyzer.winHome.open();	
}
