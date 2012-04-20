/**
 * @author Caspar Addyman
 * 
 * The user interface for the emotion & drunkness tracking screen.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

	var currentSessionID = -1, previousSessionID = -2;
	var drunkeness, energy, happiness, lastChangedLabel;
	var winOpened, loadedonce;
	var winHome;
	
	var menu = require('/ui/menu');
	
	exports.createApplicationWindow = function(){
		var win = Titanium.UI.createWindow({
			title:'YBOB Boozerlyzer',
			backgroundImage:'/images/smallcornercup.png',
			modal:true,
			});	
			win.orientationModes =  [Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];	

		var winHome = win.home;
		var tic = new Date(); //used for counting blur times.

		var dbSelfAssessment = require('/db/selfAssessment');
		var dbSessions = require('/db/sessions');
		var dbGameScores = require('/db/gameScores');
		var dateTimeHelpers = require('/js/dateTimeHelpers');
		var dataObject = require('/db/dataObject');	
		var currentEmotions = dataObject.getCurrentEmotions();
		menu.setHelpMessage("Move sliders to appropriate points to indicate how you currently feel.");
	 	//for modal windows we use win.activity for onCreateOptionsMenu
	 	win.activity.onCreateOptionsMenu = function(event){
			menu.createMenus(event);
		};

		
		//layout variables
		var sizeIcon = 48, leftLowIcon = 48;
		var leftSlider = leftLowIcon+sizeIcon;
		var leftLabels = leftSlider;
		var widthSlider = 240;
		var leftHighIcon = leftSlider + widthSlider + 5;
		var topHappiness = 24, topEnergy = 100, topDrunk = 176, topLastEvent = 220;
		var rightNewDrinks = 70, rightPlayGame = 10;
		
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
			image:'/icons/Sad.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topHappiness,
			left:leftLowIcon
		});
		var happinessHigh = Titanium.UI.createImageView({
			image:'/icons/Happy.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topHappiness,
			left:leftHighIcon
		});
		happiness = Titanium.UI.createSlider({
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
			currentEmotions[0].Changed = true;
			currentEmotions[0].Happiness =Math.round(e.value);
			Ti.API.debug('HappyBlur: '+currentEmotions[0].HappyBlur);
		});
		happiness.addEventListener('touchstart', function(e)
		{
			tic = new Date().getTime();
		});
		happiness.addEventListener('touchend', function(e)
		{
			currentEmotions[0].HappyBlur += (new Date().getTime()-tic);
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
			image:'/icons/OffLamp.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topEnergy,
			left:leftLowIcon
		});
		var energyHigh = Titanium.UI.createImageView({
			image:'/icons/OnLamp.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topEnergy,
			left:leftHighIcon
		});
		energy = Titanium.UI.createSlider({
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
			currentEmotions[0].Changed = true;
			currentEmotions[0].Energy =Math.round(e.value);
			Ti.API.debug('EnergyBlur: '+currentEmotions[0].EnergyBlur);
		});
		// For #806
		energy.addEventListener('touchstart', function(e)
		{
			tic = new Date().getTime();
		});
		energy.addEventListener('touchend', function(e)
		{
			currentEmotions[0].EnergyBlur += (new Date().getTime()-tic);
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
			image:'/icons/sober.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topDrunk-10,
			left:leftLowIcon
		});
		//apologies for the following variable name!
		var drunkDrunk = Titanium.UI.createImageView({
			image:'/icons/drunk.png',
			height:sizeIcon,
			width:sizeIcon,
			top:topDrunk,
			left:leftHighIcon
		});
		drunkeness = Titanium.UI.createSlider({
			min:0,
			max:100,
			value:50,
			width:widthSlider,
			top:topDrunk+10,
			left:leftSlider
		});
		
		drunkeness.addEventListener('change',function(e)
		{
			currentEmotions[0].Changed = true;
			currentEmotions[0].Drunkeness =Math.round(e.value);
		});
		drunkeness.addEventListener('touchstart', function(e)
		{
			tic = new Date().getTime();
		});
		drunkeness.addEventListener('touchend', function(e)
		{
			currentEmotions[0].DrunkBlur += (new Date().getTime()-tic);
			Ti.API.debug('DrunkBlur: '+currentEmotions[0].DrunkBlur);
		});
		
		win.add(drunkenessLabel);
		win.add(drunkeness);
		win.add(drunkSober);
		win.add(drunkDrunk);
		
		lastChangedLabel = Ti.UI.createLabel({
			text:'Last Updated  - never',
			top:topLastEvent,
			left:leftSlider,
			width:widthSlider,
			textAlign:'center'
		});
		win.add(lastChangedLabel);
		
		
		// record activity data for right now
		// and give user 2 lab points for using this screen
		function gameEndSaveScores(){
			if (!currentEmotions[0].Changed) {return;}
			dbSelfAssessment.setData(currentEmotions);
			dbSessions.Updated(currentSessionID);
			var gameSaveData = [{Game: 'TrackMood',
							GameVersion:2,
							PlayStart:winOpened ,
							PlayEnd: parseInt((new Date()).getTime()/1000,10),
							TotalScore:happiness.value,
							Speed_GO:0,
							Speed_NOGO:0,
							Coord_GO:0,
							Coord_NOGO:0,
							Level:energy.value,
							Inhibition:drunkeness.value,
							Feedback:'',
							Choices:'',
							SessionID:currentSessionID,
							UserID:Titanium.App.Properties.getInt('UserID'),
							LabPoints:8	
						}];
			dbGameScores.SaveResult(gameSaveData);
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
		
		save.addEventListener('click',function()
		{
			//shouldn't have to copy these values in again
			//but do it anyway, don't trust the change events
			currentEmotions[0].Changed = true;
			currentEmotions[0].Happiness = happiness.value;
			currentEmotions[0].Drunkeness = drunkeness.value;
			currentEmotions[0].Energy = energy.value;
			currentEmotions[0].SessionID = currentSessionID;
			dbSelfAssessment.setData(currentEmotions);
			dbSessions.Updated(currentSessionID);
			updated = dateTimeHelpers.prettyDate(currentEmotions[0].SelfAssessmentStart);
			lastChangedLabel.text = 'Last Updated  ' + updated;
			currentEmotions[0].DrunkBlur = 0;
			currentEmotions[0].HappyBlur = 0;
			currentEmotions[0].EnergyBlur = 0;
			gameEndSaveScores();
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
			image:'/icons/newdrinks.png',
			height:bigIcons,
			width:bigIcons,
			bottom:bottomButtons,
			left:leftFirst
		});
		newdrinks.addEventListener('click',function(){
			var win_drinks = require('/win/win_drinks');
			var winDrinks = win_drinks.createApplicationWindow();
			winDrinks.open();
			win.close();
		});
		win.add(newdrinks);
		
		var newtripreport = Titanium.UI.createImageView({
			image:'/icons/tripreport.png',
			height:bigIcons * 0.8,
			width:bigIcons * 0.8,
			bottom:bottomButtons,
			left:leftSecond
		});
		newtripreport.addEventListener('click',function(){
			var win_TripReport = require('/win/win_tripreport');
			var winTripReport = win_TripReport.createApplicationWindow();
			winTripReport.open();
			win.close();
		});
		win.add(newtripreport);
		
		var newgame = Titanium.UI.createImageView({
			image:'/icons/hamsterwheel.png',
			height:bigIcons,
			width:bigIcons,
			bottom:bottomButtons,
			left:leftThird
		});
		newgame.addEventListener('click',function(){
			var  winGames = require('/win/win_gameMenu');
			var winGameMenu =winGames.createApplicationWindow();
			winGameMenu.open();
			win.close();
		});
		win.add(newgame);
		
		//TODO
		//There ought to be a simple way of wrapping this up as a UI element rather than repeating code in 
		//every win_.js file but i tried it a few ways and i never got it to work.
		function goHome(){
			gameEndSaveScores();
			if (!winHome) {
				var winmain = require('/win/win_main');
				winHome = winmain.createApplicationWindow();
			}
			win.close();
			winHome.open();
		}
		//invisible button to return home over the cup
		var homeButton = Titanium.UI.createView({
									image:'/icons/transparenticon.png',
									bottom:0,
								    left:0,
								    width:30,
								    height:60
							    });
		win.add(homeButton);
		// Cleanup and return home
		homeButton.addEventListener('click',goHome);
		win.addEventListener('android:back', goHome);
	
		//overload the open function to display help dialog
		win.addEventListener('open', function(){
			var initialHelp = require('/ui/initialHelpDialog');
			initialHelp.showNotice('selfAssessmentDialog','Move sliders to record your happiness, energy level and estimated drunkeness.');
		});	

		win.refreshData = function(){
			//current session ID
			currentSessionID = Titanium.App.Properties.getInt('SessionID');
			
			Ti.API.debug('win_emotion retrieved SessionID property - ' + currentSessionID);
			
			//most recent emotion values for this session
			if (currentSessionID !== previousSessionID || !currentEmotions || currentEmotions === null || currentEmotions === 'undefined'){
				currentEmotions = dbSelfAssessment.getLatestData(currentSessionID);
			}
			if (currentEmotions === null || currentEmotions[0].Happinessnow < 0 ){
				Titanium.API.trace('Boozerlyzer - currentEmotion could not be retrieved');
				currentEmotions= dbSelfAssessment.newEmotion(false);
			}
			Titanium.API.debug(JSON.stringify(currentEmotions));
			currentEmotions[0].SelfAssessmentStart = winOpened;
			currentEmotions[0].SessionID = currentSessionID;
			//clear the blur values as we start those afresh
			currentEmotions[0].DrunkBlur = 0;
			currentEmotions[0].HappyBlur = 0;
			currentEmotions[0].EnergyBlur = 0;
			
			winOpened = parseInt((new Date()).getTime()/1000, 10);
			if (Titanium.App.Properties.getBool('MateMode',false)){
				win.backgroundImage = '/images/smallcornercup.matemode.png';
			}else{
				win.backgroundImage = '/images/smallcornercup.png';
			}
			var emotionsChanged = false;
			var happyBlur = 0;
			
			//set the old values
			drunkeness.value = currentEmotions[0].Drunkeness;
			energy.value = currentEmotions[0].Energy;
			happiness.value = currentEmotions[0].Happiness;		
			var updated = dateTimeHelpers.prettyDate(currentEmotions[0].SelfAssessmentStart);
			lastChangedLabel.text = 'Last Updated  ' + updated;
			//set up for this session only relaoad everything sessionid changes next time we reload
			previousSessionID = currentSessionID;
		};
		win.refreshData();		
		loadedonce = true;
		return win;
		
	};