/**
 * @author Caspar Addyman
 * 
 * The user interface for the emotion & drunkness tracking screen.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {
			
		var win = Titanium.UI.currentWindow;
		var winHome = win.home;
		var winOpened = parseInt((new Date()).getTime()/1000);
		var tic = new Date(); //used for counting blur times.
		
		
		var emotionsChanged = false;
		var happyBlur = 0;
		
		//current session ID
		var SessionID = Titanium.App.Properties.getInt('SessionID');
		Ti.API.debug('win_emotion retrieved SessionID property - ' + SessionID);
		
		//most recent emotion values for this session
		var currentEmotion = Titanium.App.boozerlyzer.data.selfAssessment.getLatestData(SessionID);
		if (currentEmotion === null || currentEmotion === false){
			Titanium.API.trace('Boozerlyzer - currentEmotion could not be retrieved');
			currentEmotion = Titanium.App.boozerlyzer.data.selfAssessment.newEmotion(false);
		}
		Titanium.API.debug(JSON.stringify(currentEmotion));
		currentEmotion[0].SelfAssessmentStart = winOpened;
		currentEmotion[0].SessionID = SessionID;
		//clear the blur values as we start those afresh
		currentEmotion[0].DrunkBlur = 0;
		currentEmotion[0].HappyBlur = 0;
		currentEmotion[0].EnergyBlur = 0;
		
		//layout variables
		var sizeIcon = 48;
		var leftLowIcon = 48;
		var leftSlider = leftLowIcon+sizeIcon;
		var leftLabels = leftSlider;
		var widthSlider = 240
		var leftHighIcon = leftSlider + widthSlider + 5;
		var topHappiness = 24;
		var topEnergy = 100;
		var topDrunk = 176;
		var topLastEvent = 220;
		//var leftPlayGame = 300;
		var rightNewDrinks = 70;
		var rightPlayGame = 10;
		
		//
		// HAPPINESS SLIDER
		//
		var happinessLabel = Ti.UI.createLabel({
			text:'Happiness',
			top:topHappiness - 9,
			left:leftSlider,
			width:widthSlider,
			textAlign:'center'
		});
		
		var happinessLow = Titanium.UI.createImageView({
			image:'../icons/Sad.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topHappiness,
			left:leftLowIcon
		});
		var happinessHigh = Titanium.UI.createImageView({
			image:'../icons/Happy.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topHappiness,
			left:leftHighIcon
		});
		var happiness = Titanium.UI.createSlider({
			min:0,
			max:100,
			value:0,
			width:widthSlider,
			top:topHappiness + 10,
			left:leftSlider
		});
		win.add(happinessLabel);
		win.add(happinessLow);
		win.add(happinessHigh);
		win.add(happiness);
		
		happiness.addEventListener('change',function(e)
		{
			currentEmotion[0].Changed = true;
			currentEmotion[0].Happiness =Math.round(e.value);
			Ti.API.debug('HappyBlur: '+currentEmotion[0].HappyBlur);
		});
		happiness.addEventListener('touchstart', function(e)
		{
			tic = new Date().getTime();
		});
		happiness.addEventListener('touchend', function(e)
		{
			currentEmotion[0].HappyBlur += (new Date().getTime()-tic);
		});
		
		//
		// ENERGY SLIDER
		//
		var energyLabel = Ti.UI.createLabel({
			text:'Energy',
			top:topEnergy - 9,
			left:leftSlider,
			width:widthSlider,
			textAlign:'center'
		});
		var energyLow = Titanium.UI.createImageView({
			image:'../icons/OffLamp.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topEnergy,
			left:leftLowIcon
		});
		var energyHigh = Titanium.UI.createImageView({
			image:'../icons/OnLamp.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topEnergy,
			left:leftHighIcon
		});
		var energy = Titanium.UI.createSlider({
			min:0,
			max:100,
			value:0,
			width:widthSlider,
			top:topEnergy + 10,
			left:leftSlider
		});
		win.add(energyLabel);
		win.add(energyLow);
		win.add(energyHigh);
		win.add(energy);
		
		energy.addEventListener('change',function(e)
		{
			currentEmotion[0].Changed = true;
			currentEmotion[0].Energy =Math.round(e.value);
			Ti.API.debug('EnergyBlur: '+currentEmotion[0].EnergyBlur);
		});
		// For #806
		energy.addEventListener('touchstart', function(e)
		{
			tic = new Date().getTime();
		});
		energy.addEventListener('touchend', function(e)
		{
			currentEmotion[0].EnergyBlur += (new Date().getTime()-tic);
		});
		
		//
		// DRUNKENESS SLIDER
		//
		var drunkenessLabel = Ti.UI.createLabel({
			text:'Drunkeness',
			top:topDrunk - 9,
			left:leftSlider,
			width:widthSlider,
			textAlign:'center'
		});
		var drunkSober = Titanium.UI.createImageView({
			image:'../icons/sober.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topDrunk-10,
			left:leftLowIcon
		});
		//apologies for the following variable name!
		var drunkDrunk = Titanium.UI.createImageView({
			image:'../icons/drunk.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topDrunk,
			left:leftHighIcon
		});
		
		var drunkeness = Titanium.UI.createSlider({
			min:0,
			max:100,
			value:50,
			width:widthSlider,
			top:topDrunk+10,
			left:leftSlider
		});
		
		drunkeness.addEventListener('change',function(e)
		{
			currentEmotion[0].Changed = true;
			currentEmotion[0].Drunkeness =Math.round(e.value);
		});
		drunkeness.addEventListener('touchstart', function(e)
		{
			tic = new Date().getTime();
		});
		drunkeness.addEventListener('touchend', function(e)
		{
			currentEmotion[0].DrunkBlur += (new Date().getTime()-tic);
			Ti.API.debug('DrunkBlur: '+currentEmotion[0].DrunkBlur);
		});
		
		win.add(drunkenessLabel);
		win.add(drunkeness);
		win.add(drunkSober);
		win.add(drunkDrunk);
		
		//set the old values
		drunkeness.value = currentEmotion[0].Drunkeness;
		energy.value = currentEmotion[0].Energy;
		happiness.value = currentEmotion[0].Happiness;
		
		var updated = Titanium.App.boozerlyzer.dateTimeHelpers.prettyDate(currentEmotion[0].SelfAssessmentStart);
		var lastchangedLabel = Ti.UI.createLabel({
			text:'Last Updated  ' + updated,
			top:topLastEvent,
			left:leftSlider,
			width:widthSlider,
			textAlign:'center'
		});
		win.add(lastchangedLabel);
		
		
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
		
		save.addEventListener('click',function()
		{
			//shouldn't have to copy these values in again
			//but do it anyway, don't trust the change events
			currentEmotion[0].Changed = true;
			currentEmotion[0].Happiness = happiness.value;
			currentEmotion[0].Drunkeness = drunkeness.value;
			currentEmotion[0].Energy = energy.value;
			currentEmotion[0].SessionID = SessionID;
			Titanium.App.boozerlyzer.data.selfAssessment.setData(currentEmotion);
			Ti.App.boozerlyzer.data.sessions.Updated(SessionID);
			updated = Titanium.App.boozerlyzer.dateTimeHelpers.prettyDate(currentEmotion[0].SelfAssessmentStart);
			lastchangedLabel.text = 'Last Updated  ' + updated;
			currentEmotion[0].DrunkBlur = 0;
			currentEmotion[0].HappyBlur = 0;
			currentEmotion[0].EnergyBlur = 0;
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
		
		// BACK TO NEW DRINKS
		var newdrinks = Titanium.UI.createImageView({
			image:'../icons/newdrinks.png',
			height:bigIcons,
			width:bigIcons,
			bottom:bottomButtons,
			left:leftFirst
		});
		newdrinks.addEventListener('click',function(){
			var newdosewin = Titanium.UI.createWindow({ modal:true,
				modal:true,
				url:'../win/win_dosage.js',
				title:'What have you had to drink?',
				backgroundImage:'../images/smallcornercup.png'
			});
			newdosewin.open();
		});
		win.add(newdrinks);
		
		var newtripreport = Titanium.UI.createImageView({
			image:'../icons/tripreport.png',
			height:bigIcons * .8,
			width:bigIcons * .8,
			bottom:bottomButtons,
			left:leftSecond
		});
		newtripreport.addEventListener('click',function(){
			var newtripwin = Titanium.UI.createWindow({ modal:true,
				modal:true,
				url:'../win/win_tripreport.js',
				title:'How are you feeling?',
				backgroundImage:'../images/smallcornercup.png'
			});
			newtripwin.open();
		});
		win.add(newtripreport);
		
		var newgame = Titanium.UI.createImageView({
			image:'../icons/hamsterwheel.png',
			height:bigIcons,
			width:bigIcons,
			bottom:bottomButtons,
			left:leftThird
		});
		newgame.addEventListener('click',function(){
			var winplay = Titanium.UI.createWindow({ modal:true,
				modal:true,
				url:'../win/win_gameMenu.js',
				title:'YBOBGame',
				backgroundImage:'../images/smallcornercup.png'
			});
			winplay.open();
			winplay.home = winHome;
			win.close();
		});
		win.add(newgame);
		
		//
		// Cleanup and return home
		win.addEventListener('android:back', function(e) {
			Titanium.App.boozerlyzer.data.selfAssessment.setData(currentEmotion);
			Ti.App.boozerlyzer.data.sessions.Updated(SessionID);
			if (Ti.App.boozerlyzer.winHome === undefined 
			 || Ti.App.boozerlyzer.winHome === null) {
				Ti.App.boozerlyzer.winHome = Titanium.UI.createWindow({ modal:true,
					url: '../app.js',
					title: 'Boozerlyzer',
					backgroundImage: '../images/smallcornercup.png',
					orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
				})
			}
			win.close();
			Ti.App.boozerlyzer.winHome.open();
	});
		
		// record activity data for right now
		// and give user 2 lab points for using this screen
		function gameEndSaveScores(){
		var gameSaveData = [{Game: 'Emotion',
							GameVersion:1,
							PlayStart:winopened ,
							PlayEnd: parseInt((new Date()).getTime()/1000),
							TotalScore:happiness.value,
							Speed_GO:energy.value,
							Speed_NOGO:0,
							Coord_GO:drunkeness.value,
							Coord_NOGO:0,
							Level:0,
							Inhibition:0,
							Feedback:'',
							Choices:'',
							SessionID:Titanium.App.Properties.getInt('SessionID'),
							UserID:Titanium.App.Properties.getInt('UserID'),
							LabPoints:2		
						}];
			Titanium.App.boozerlyzer.data.gameScores.Result(gameSaveData);
		}

				
		win.addEventListener('close', function(){
			if (loadedonce){
				//this code only runs when we reload this page
				gameEndSaveScores();			
				}
		});
		
		
})();