/**
 * @author Caspar Addyman
 * 
 * The screen for entering a text entry of how user is feeling
 * 
 * Copyright yourbrainondrugs.net 2011
 */

exports.createApplicationWindow =function(type){
	var win = Titanium.UI.createWindow({
		title:'YBOB Boozerlyzer',
		backgroundImage:'/images/smallcornercup.png',
		modal:true,
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	});	
	var winOpened = parseInt((new Date()).getTime()/1000,10);
	var reportType = type;
	//include the menu choices	
	//include the menu choices	
	// Ti.include('/ui/menu.js');
	// var menu = menus;
	var menu = require('/ui/menu');
	
	var choices = ['Main Menu','Add drinks','Feelings','Game Menu', 'Raccoon Hunt', 'Memory Game', 'Number Stroop', 'Pissonyms', 'Emotional Words', 'We Feel Fine', 'High Scores', 'Graphs','Personal Info', 'Log on & Security', 'Other..'];

	
	//layout variables
	var topHeading = 5, topContent = 50, topChangedLabel = 200;
	//current session ID
	var SessionID = Titanium.App.Properties.getInt('SessionID');
	
	//most recent emotion values for this session
	var currentTripReport = Boozerlyzer.db.tripReports.getLatestData(SessionID);
	if (currentTripReport === null || currentTripReport === false){
		currentTripReport = Boozerlyzer.db.tripReports.newReport();
	}
	Titanium.API.debug(JSON.stringify(currentTripReport));
	
	
	var label = Titanium.UI.createLabel({
		text:'How are you?',
		left:80,
		top:topHeading+10,
		font:{fontSize:18,fontWeight:'bold'}
	});
	win.add(label);
	
	var tripContent = Titanium.UI.createTextField({
		value:currentTripReport[0].Content,
		color:'#336699',
		hintText:'I feel...',
		textAlign:'left',
		height:140,
		top:topContent,
		left:10,
		right:10,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		font:{fontSize:18,fontWeight:'bold'}
	});
	win.add(tripContent);
	tripContent.addEventListener('change', function(){
		currentTripReport[0].Changed = true;
		currentTripReport[0].Content = tripContent.value;
	});
	
	var updated = Boozerlyzer.dateTimeHelpers.prettyDate(currentTripReport[0].ReportChanged);
	var lastchangedLabel = Ti.UI.createLabel({
		text:'Last Updated\n' + updated,
		top:topChangedLabel,
		left:10,
		width:'auto',
		textAlign:'center'
	});
	win.add(lastchangedLabel);
	
	//log data to the activity tracker
	// record the total units at the moment
	// and give user 2 lab points for using this screen
	function gameEndSaveScores(){
		Ti.API.debug('Trip Report gameEndSaveScores');
		
		var gameSaveData = [{Game: reportType,
							GameVersion:1,
							PlayStart:winOpened ,
							PlayEnd: parseInt((new Date()).getTime()/1000, 10),
							TotalScore:0,
							GameSteps:0,
							Speed_GO:0,
							Speed_NOGO:0,
							Coord_GO:0,
							Coord_NOGO:0,
							Level:0,
							Inhibition:0,
							Feedback:tripContent.value,
							Choices:choiceLabel.value,
							SessionID:Titanium.App.Properties.getInt('SessionID'),
							UserID:Titanium.App.Properties.getInt('UserID'),
							LabPoints:8	
						}];
		Boozerlyzer.db.gameScores.SaveResult(gameSaveData);
	}
	
	// SAVE BUTTON	
	var save = Ti.UI.createButton({
		title:'Save',
		width:70,
		height:28,
		bottom:4,
		right:4,
		backgroundColor:'green'
	});
	win.add(save);
	
	save.addEventListener('click',function(){
		Boozerlyzer.db.sessions.Updated(SessionID);
		Boozerlyzer.db.tripReports.setData(currentTripReport);
		Boozerlyzer.winHome.open();
		Boozerlyzer.winHome.refresh();
		win.close();		
	});	
	
	// CANCEL BUTTON	
	var cancel = Ti.UI.createButton({
		title:'Cancel',
		width:70,
		height:28,
		bottom:4,
		right:80,
		backgroundColor:'red'
	});
	win.add(cancel);
	
	cancel.addEventListener('click',function()
	{
		win.close();
	});	
	
	// ICONS TO GO TO OTHER SCREENS
	//
	//layout variables
	//Button layout Vars
	var bigIcons = 60;
	var bottomButtons = 5;
	var leftFirst = 60;
	var leftSecond = 140;
	var leftThird = 200;
	

	// button to tag this as a bug report
	var addbug = Titanium.UI.createImageView({
		image:'/icons/add_bug.png',
		height:bigIcons,
		width:bigIcons,
		top:10,
		left:10
	});
	win.add(addbug);
	

	// BACK TO NEW DRINKS
	var newdrinks = Titanium.UI.createImageView({
		image:'/icons/newdrinks.png',
		height:bigIcons,
		width:bigIcons,
		bottom:bottomButtons,
		left:leftFirst
	});
	newdrinks.addEventListener('click',function(){
		// if (!Boozerlyzer.winDrinks ){
			Boozerlyzer.winDrinks = Boozerlyzer.win.drinks.createApplicationWindow();
		// }
		Boozerlyzer.winDrinks.open();
		win.close();
	});
	win.add(newdrinks);
	
	var newmood = Titanium.UI.createImageView({
		image:'/icons/TheaterYellow2.png',
		height:bigIcons,
		width:bigIcons,
		bottom:bottomButtons,
		left:leftSecond
	});
	newmood.addEventListener('click',function(){
		// if (!Boozerlyzer.winEmotion){
			Boozerlyzer.winEmotion = Boozerlyzer.win.emotion.createApplicationWindow();
		// }
		Boozerlyzer.winEmotion.open();
		win.close();
	});
	win.add(newmood);
	
	var newgame = Titanium.UI.createImageView({
		image:'/icons/hamsterwheel.png',
		height:bigIcons,
		width:bigIcons,
		bottom:bottomButtons,
		left:leftThird
	});
	newgame.addEventListener('click',function(){
		// if (!Boozerlyzer.winGameMenu || Boozerlyzer.winGameMenu === undefined){
			Boozerlyzer.winGameMenu = Boozerlyzer.win.gameMenu.createApplicationWindow();
		// }
		Boozerlyzer.winGameMenu.open();
		win.close();
	});
	win.add(newgame);
	
	var choiceLabel = Titanium.UI.createLabel({
		text:'Click to specify bug location',
		top:topChangedLabel,
		left:40,
		width:'auto',
		textAlign:'center',
		backgroundColor:'black',
		borderRadius:2
	});
	//click on choice label to change it.
	choiceLabel.addEventListener('click', function(){
		if (choiceLabel.visible){
			choiceDialog();
		}
	});
	win.add(choiceLabel);
	
	
	function choiceDialog(){
		var newDialog = Titanium.UI.createOptionDialog({
			options:choices,
			destructive:2,
			cancel:1,
			title:'Where was the bug?'
		});
		// add event listener
		newDialog.addEventListener('click',function(e)
		{
			choiceLabel.text = choices[e.index];
		});
		newDialog.show();
	}
	
	if (reportType === 'BUG'){
		//need to give it specific help for this screen
		menu.setHelpMessage("Simply record what went wrong. Thanks.");
		tripContent.hintText = 'What caused the error?';
		label.text = 'Tell us what went wrong';
		addbug.visible = true;
		choiceLabel.visible = true;
		lastchangedLabel.visible = false;
		
	}else{
		//need to give it specific help for this screen
		menu.setHelpMessage("Simply record how you are feeling right now. Thanks :-)");
		tripContent.hintText = 'I feel..';
		label.text = 'How are you?';
		addbug.visible = false;
		choiceLabel.visible = false;
		lastchangedLabel.visible = true;
	}
	
	
	win.addEventListener('open', function(){
		if (reportType === 'BUG'){
			choiceDialog()
		};	
	});
	//
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (Boozerlyzer.winHome === undefined || Boozerlyzer.winHome === null) {
			Boozerlyzer.winHome = Boozerlyzer.win.main.createApplicationWindow();
		}
		Boozerlyzer.winHome.open();
		Boozerlyzer.winHome.refresh();
		win.close();
	});
	return win;
};
