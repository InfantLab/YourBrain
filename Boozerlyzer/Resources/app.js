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

//launch main app
var winMain = require('/win/win_main'); 
var winHome = winMain.createApplicationWindow(true);
winHome.open();	
				
var registrationNag = Titanium.App.Properties.getInt('RegistrationNag', 0);
if (registrationNag < 0){
	//launch main app	
	Ti.API.debug('Boozerlyzer Started');
	var gameSaveData = [{Game: 'Boozerlyzer Started',
				GameVersion:1,
				PlayStart:parseInt((new Date()).getTime()/1000,10) ,
				PlayEnd: 0,
				TotalScore:0,
				GameSteps:0,
				Speed_GO:0,
				Speed_NOGO:0,
				Coord_GO:0,
				Coord_NOGO:0,
				Level:0,
				Inhibition:0,
				Feedback:'',
				Choices:'',
				SessionID:Titanium.App.Properties.getInt('SessionID',0),
				UserID:Titanium.App.Properties.getInt('UserID', 0),
				LabPoints:8
			}];
	var dbGameScores = require('/db/gameScores');
	dbGameScores.SaveResult(gameSaveData);
}else if (registrationNag === 0){
	var win_myData = require('/win/win_mydata');
	var winMyData = win_myData.createApplicationWindow();
	winMyData.open();
}else{
	//we will nag them eventually.
	Titanium.App.Properties.setInt('RegistrationNag', registrationNag - 1);		
}
