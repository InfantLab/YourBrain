/**
 * @author Caspar Addyman
 * 
 * The screen for entering a text entry of how user is feeling
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {
	
	var win = Titanium.UI.currentWindow;
	var winOpened = parseInt((new Date()).getTime()/1000,10);
	var reportType = Titanium.UI.currentWindow.type;
	//include the menu choices	
	Ti.include('/ui/menu.js');
	var menu = menus;
	
	var choices = ['Main Menu','Add drinks','Feelings','Game Menu', 'Raccoon Hunt', 'Memory Game', 'Number Stroop', 'Pissonyms', 'Emotional Words', 'We Feel Fine', 'High Scores', 'Graphs','Personal Info', 'Log on & Security', 'Other..'];

	
	//layout variables
	var topHeading = 5, topContent = 50, topChangedLabel = 200;
	//current session ID
	var SessionID = Titanium.App.Properties.getInt('SessionID');
	
	//most recent emotion values for this session
	var currentTripReport = Ti.App.boozerlyzer.db.tripReports.getLatestData(SessionID);
	if (currentTripReport === null || currentTripReport === false){
		currentTripReport = Ti.App.boozerlyzer.db.tripReports.newReport();
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
	
	var updated = Ti.App.boozerlyzer.dateTimeHelpers.prettyDate(currentTripReport[0].ReportChanged);
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
							LabPoints:2		
						}];
		Ti.App.boozerlyzer.db.gameScores.SaveResult(gameSaveData);
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
		Ti.App.boozerlyzer.db.sessions.Updated(SessionID);
		Ti.App.boozerlyzer.db.tripReports.setData(currentTripReport);
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
		var newdosewin = Titanium.UI.createWindow({ modal:true,
			url:'/win/win_drinks.js',
			title:'What have you had to drink?',
			backgroundImage:'/images/smallcornercup.png'
		});
		win.close();
		newdosewin.open();
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
		var newmoodwin = Titanium.UI.createWindow({
			modal:true,
			url:'/win/win_emotion.js',
			title:'How are you feeling?',
			backgroundImage:'/images/smallcornercup.png'
		});
		win.close();
		newmoodwin.open();
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
		var winplay = Titanium.UI.createWindow({ 
			modal:true,
			url:'/win/win_gameMenu.js',
			title:'Boozerlyzer Games',
			backgroundImage:'/images/smallcornercup.png'
		});
		winplay.open();
		win.close();
	});
	win.add(newgame);
	
	var choiceLabel = Titanium.UI.createLabel({
		text:'',
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
		addbug.visble = true;
		choiceLabel.visible = true;
		lastchangedLabel.visible = false;
		choiceDialog();	
	}else{
		//need to give it specific help for this screen
		menu.setHelpMessage("Simply record how you are feeling right now. Thanks :-)");
		tripContent.hintText = 'I feel..';
		label.text = 'How are you?';
		addbug.visble = false;
		choiceLabel.visible = false;
		lastchangedLabel.visible = true;
	}
	
	
	//
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (Ti.App.boozerlyzer.winHome === undefined || Ti.App.boozerlyzer.winHome === null) {
			Ti.App.boozerlyzer.winHome = Titanium.UI.createWindow({ modal:true,
				url: '/app.js',
				title: 'Boozerlyzer',
				backgroundImage: '/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});
		}
		win.close();
		Ti.App.boozerlyzer.winHome.open();
	});
})();