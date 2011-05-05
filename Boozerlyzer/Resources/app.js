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


//application namespace
Ti.App.boozerlyzer = {};
Ti.App.boozerlyzer.win = {};
Ti.App.boozerlyzer.data ={};

//all of the data handling routines.
Ti.include('/data/sessions.js');
Ti.include('/data/doseageLog.js');
Ti.include('/data/alcoholStandardUnits.js');
Ti.include('/data/drugDoses.js');
Ti.include('/data/emotionWords.js');
Ti.include('/data/gameScores.js');
Ti.include('/data/personalInfo.js');
Ti.include('/data/pissonyms.js');
Ti.include('/data/selfAssessment.js');
Ti.include('/data/tripReports.js');
Ti.include('/data/weFeelFine.js');
//helper functions
Ti.include('/js/dateTimeHelpers.js');
	
Ti.include('/win/win_main.js'); //construct main screen UI
	
var winMain = Ti.App.boozerlyzer.win.main.createApplicationWindow();
winMain.open();
Ti.App.boozerlyzer.winHome = winMain;

