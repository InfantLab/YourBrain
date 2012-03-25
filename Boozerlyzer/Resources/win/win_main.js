/**
 * @author Caspar Addyman
 * 
 * The user interface for the main screen of the boozerlyzer app.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

	var homeWin, winCreated;
	//Create the main application window
	exports.createApplicationWindow = function(forceLoad) {
		if (!forceLoad && winCreated) {return homeWin;}
		// var menu = require('/ui/menu');
		// //need to give menu object specific help for this screen
		// menu.setHelpMessage("Click on the icons to add new drinks, launch games, etc.");
		//the start screen for the YBOB boozerlyzer
		homeWin = Titanium.UI.createWindow({
			exitOnClose: true,
			title:'YBOB Boozerlyzer',
			backgroundImage:'/images/smallcornercup.png',
			orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]
		});
		homeWin.orientationModes = [
		    Titanium.UI.LANDSCAPE_LEFT,
		    Titanium.UI.LANDSCAPE_RIGHT
		];

		/******
		 * the required modules
		 */
		var dataOverTime = require('/analysis/dataOverTime');
		var sendData = require('/comm/sendData');
		var dataObject = require('/db/dataObject');
		var gameScores = require('/db/gameScores');
		var dbSessions  = require('/db/sessions');
		var dateTimeHelpers = require('/js/dateTimeHelpers');
		var menu = require('/ui/menu');

		//need to give menu object specific help for this screen
		menu.setHelpMessage("Click on the icons to add new drinks, launch games, etc.");
	 	//for base window need to use activity for onCreateOptionsMenu
	 	var activity = Ti.Android.currentActivity;
	 	activity.onCreateOptionsMenu = function(event){
			 menu.createMenus(event);
		};

		//reset to main user and MateMode flag.
		Titanium.App.Properties.setInt('UserID',0);
		Titanium.App.Properties.setBool('MateMode',false); 
		
		var session;
		
		
		// layout variables
		var bigIcons = 76, leftAppName = 20, leftNewDrinks = 20, leftEmotion = 100, leftTripReport = 180, leftGame = 240;
		var topNewDrinks = 80, topEmotion = 80, topTripReport = 80, topGame = 80,  leftHighScores = 70, topLabPoints = 150;
		var leftUnits = 20, leftLabPoints =240, topResults = 80, leftResults = 340, optionsLeft = 320;
		
		Ti.API.debug('homeWin 1');

		
		var label1 = Titanium.UI.createLabel({
			color:'#911',
			text:'Boozerlyzer',
			font:{fontSize:48,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			width:'auto',
			top:2,
			left:leftAppName
		});
		homeWin.add(label1);
		
		var labelVers = Titanium.UI.createLabel({
			color:'#555',
			text:'Version: '+ Titanium.App.getVersion(),
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			top:53,
			left:leftAppName
		});
		homeWin.add(labelVers);
		
		
		var personalinfo = Titanium.UI.createImageView({
			image:'/icons/safe.png',
			height:48,
			width:48,
			top:20,
			left:optionsLeft
		});
		personalinfo.addEventListener('click',function(){
			var win_myData = require('/win/win_mydata');
			var winMyData = win_myData.createApplicationWindow();
			winMyData.open();
		}); 
		homeWin.add(personalinfo);

		var matemode = Titanium.UI.createImageView({
			image:'/icons/Chorus.png',
			height:48,
			width:48,
			top:20,
			left:optionsLeft + 52
		});			
		//if we click this icon toggle between normal use
		//and mate mode where scores don't count towards your own total.
		matemode.addEventListener('click', function(){
			swapMateMode();		
		});
		homeWin.add(matemode);
		
		function switchSession(newSession){
			if (newSession){
				var mateMode = Titanium.App.Properties.getBool('MateMode',false);
				session = dbSessions.createNewSession(mateMode);
			}else{
				session = dbSessions.getLatestData(0);
			}
			//clear stored data too to force itgimp to reload
			dataObject.setAllDrinks(false);//array of drinks
			dataObject.setCurrentEmotions(false); //what are current levels of happiness/energy/drunkeness 
			Titanium.App.Properties.setInt('SessionID', session[0].ID);
			Titanium.App.Properties.setInt('UserID', session[0].UserID);
		}
		
		function swapMateMode(){
			if (Titanium.App.Properties.getBool('MateMode',false)){
				Titanium.App.Properties.setBool('MateMode',false);
				//switch back into regular mode
				switchSession(false);
				Ti.API.debug("Switch out of mate mode - session info:" + JSON.stringify(session));
				homeWin.backgroundImage = '/images/smallcornercup.png';
			}else{
				Titanium.App.Properties.setBool('MateMode',true);
				switchSession(true);//is in mate mode so need a new session
				Ti.API.debug("Switch into mate mode - session info:" + JSON.stringify(session));
				homeWin.backgroundImage = '/images/smallcornercup.matemode.png';
			}	
		}
		
		var newbugreport = Titanium.UI.createImageView({
			image:'/icons/add_bug.png',
			height:48,
			width:48,
			top:20,
			left:optionsLeft + 100
		});
		newbugreport.addEventListener('click',function(){
			var win_TripReport = require('/win/win_tripreport');
			var winBugReport = win_TripReport.createApplicationWindow('BUG');
			winBugReport.home = homeWin; //reference to home
			winBugReport.addEventListener('close',homeWin.refresh);
			winBugReport.open();
		});
		homeWin.add(newbugreport);	
			
		var report = Titanium.UI.createImageView({
			image:'/icons/ybob-logo2.png',
			height:160,
			width:140,
			top:topResults,
			left:leftResults
		});
		
		report.addEventListener('click',function(){
			//var win_charts = require('/win/win_charts');
			var win_charts = require('/win/win_chartMenu');
			var winCharts = win_charts.createApplicationWindow();
			winCharts.home = homeWin; //reference to home
			winCharts.addEventListener('close',homeWin.refresh);				
			winCharts.open();
		});
		homeWin.add(report);
		
		
		var newdrinks = Titanium.UI.createImageView({
			image:'/icons/newdrinks.png',
			height:bigIcons,
			width:bigIcons,
			top:topNewDrinks,
			left:leftNewDrinks
		});
		newdrinks.addEventListener('click',function(){
			var win_drinks = require('/win/win_drinks');
			var winDrinks = win_drinks.createApplicationWindow();
			winDrinks.home = homeWin; //reference to home
			winDrinks.addEventListener('close',homeWin.refresh);				
			winDrinks.open();
		});
		homeWin.add(newdrinks);
		
		var newmood = Titanium.UI.createImageView({
			image:'/icons/TheaterYellow2.png',
			height:bigIcons,
			width:bigIcons,
			top:topEmotion,
			left:leftEmotion
		});
		newmood.addEventListener('click',function(){
			var win_emotion = require('/win/win_emotion');
			var winEmotion = win_emotion.createApplicationWindow();
			winEmotion.home = homeWin; //reference to home
			winEmotion.addEventListener('close',homeWin.refresh);							
			winEmotion.open();
		});
		homeWin.add(newmood);
		
		var newtripreport = Titanium.UI.createImageView({
			image:'/icons/tripreport.png',
			height:bigIcons * 0.8,
			width:bigIcons * 0.8,
			top:topNewDrinks,
			left:leftTripReport
		});
		newtripreport.addEventListener('click',function(){
			var win_TripReport = require('/win/win_tripreport');
			var winTripReport = win_TripReport.createApplicationWindow();
			winTripReport.home = homeWin; //reference to home
			winTripReport.addEventListener('close',homeWin.refresh);							
			winTripReport.open();
		});
		homeWin.add(newtripreport);
		
		var newgame = Titanium.UI.createImageView({
			image:'/icons/hamsterwheel.png',
			height:bigIcons,
			width:bigIcons,
			top:topGame,
			left:leftGame
		});
		newgame.addEventListener('click',function(){
			var win_gameMenu = require('/win/win_gameMenu');
			var winGameMenu = win_gameMenu.createApplicationWindow();
			winGameMenu.home = homeWin; //reference to home
			winGameMenu.addEventListener('close',homeWin.refresh);							
			winGameMenu.open();
		});
		homeWin.add(newgame);

		var labelHighScores = Titanium.UI.createLabel({
			text:'High Scores',
			font:{fontSize:24,fontFamily:'sans-serif',fontWeight:'bold'},
			textAlign:'center',
			height:bigIcons,
			width:bigIcons * 3.05,
			//top:topHighScores,
			bottom:4,
			left:leftHighScores,
			color:'green',
			zIndex:0,
		});
		homeWin.add(labelHighScores);
		
		
		var highScores = Titanium.UI.createImageView({
			image:'/icons/Evolution.png',
			height:bigIcons,
			width:bigIcons * 3.05,  //keep correct proportions
			//top:topHighScores,
			bottom:4,
			left:leftHighScores,
			opacity:0.3
		});
		highScores.addEventListener('click',function(){
			var win_HighScores = require('/win/win_highScores');
			var winHighScores = win_HighScores.createApplicationWindow();
			winHighScores.home = homeWin; //reference to home
			winHighScores.addEventListener('close',homeWin.refresh);
			winHighScores.open();
		});
		homeWin.add(highScores);

		var labelLabPoints = Titanium.UI.createLabel({
			text:'0000',
			font:{fontSize:28,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			height:32,
			width:80,
			top:topLabPoints + 20,
			left:leftLabPoints,
			color:'cyan',
			shadowColor:'black',
			shadowOffset:{X:6,y:6},
			borderRadius:4
		});
		homeWin.add(labelLabPoints);
		var captionLabPoints = Titanium.UI.createLabel({
			text:'Lab Points',
			font:{fontSize:14,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			height:32,
			top:topLabPoints + 54,
			left:leftLabPoints,
			color:'cyan'
		});
		homeWin.add(captionLabPoints);
		
		var labelUnits = Titanium.UI.createLabel({
			text:'00',
			font:{fontSize:28,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			height:32,
			width:60,
			top:topLabPoints + 20,
			left:leftUnits,
			color:'green',
			shadowColor:'black',
			shadowOffset:{X:6,y:6},
			borderRadius:4
		});
		homeWin.add(labelUnits);
		var captionUnits = Titanium.UI.createLabel({
			text:'Units /\nStandard Drinks',
			font:{fontSize:11,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			height:32,
			top:topLabPoints + 54,
			left:leftUnits,
			color:'green'
		});
		homeWin.add(captionUnits);
		
		
		var labelCurrentSession = Titanium.UI.createLabel({
			text:'Session started\n Sat 3th, 12:00pm',
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			right:4,
			height:32,
			width:120,
			bottom:1,
			color:'white',
			backgroundColor:'black',
			borderColor:'gray',
			borderRadius:4
		});
		labelCurrentSession.addEventListener('click', function(){
			newSessionDialog.show();
		});
		var labelLastUpdate = Titanium.UI.createLabel({
			color:'#000',
			text:'',
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			right:4,
			height:32,
			width:120,
			bottom:33
		});
		homeWin.add(labelCurrentSession);
		homeWin.add(labelLastUpdate);
		Ti.API.debug('homeWin 2');
		

		function rewriteSessionInfo(){
			//function that writes the latest update times for this session.			
			Ti.API.debug('rewriteSessionInfo');
			var timeSinceUpdate = dateTimeHelpers.prettyDate(session[0].LastUpdate);
			labelLastUpdate.text = 'Last activity\n' + timeSinceUpdate;
			labelCurrentSession.text = 'Session Started\n' + dateTimeHelpers.formatDayPlusTime(session[0].StartTime,true);
			Ti.API.debug('Session ID - ' + session[0].ID);
			Titanium.App.Properties.setInt('SessionID', session[0].ID);
			Titanium.App.Properties.setInt('SessionStart',session[0].StartTime/1000);
			Titanium.App.Properties.setInt('SessionChanged',session[0].LastUpdate/1000);	
		}

		var newSessionDialog = Titanium.UI.createOptionDialog({
			options:['New session', 'Continue..'],
			destructive:2,
			cancel:1,
			title:'Start a new session?'
		});
		homeWin.add(newSessionDialog);
		// add event listener
		newSessionDialog.addEventListener('click',function(e)
		{
			if (e.index === 0) {
				switchSession(true);
				homeWin.refresh();
			}
		});

		//what is the current session? 
		//if last update was >36 hours ago automatically start new session
		//if last update was >12 hours ago ask if what to start new session
		//if last update was <12 hours ago continue that session[0].
		if (session === undefined){
			session = dbSessions.getLatestData(0);
			if (session === null || session === false){
				switchSession(true);
				homeWin.refresh();
			}
				
		}
		Titanium.API.debug("session info: " + JSON.stringify(session));
		var now = parseInt((new Date()).getTime()/1000, 10);
		if (now - session[0].LastUpdate  <43200){ 
			//less than 12hours - carry on 
		}else if (now - session[0].LastUpdate < 129600){ //36 hours
			var timeSinceUpdate = dateTimeHelpers.prettyDate(session[0].LastUpdate);
			newSessionDialog.title = 'Last update ' + timeSinceUpdate + '\nStart a new session?';
			newSessionDialog.show();
		}else{
			//>36 hours since last update, don't ask just start new
			switchSession(true);
			homeWin.refresh();
		} 
		Ti.API.debug('homeWin 3');

		//updates the lab points counter
		function rewriteLabPoints(){
			Ti.API.debug('rewriteLabPoints');
			var labPoints = gameScores.TotalPoints(); 
			labelLabPoints.text = labPoints[0].Total.toFixed(0); //+ ' Pts';	
		}
		function rewriteUnitsBAC(){
			var totals = dataOverTime.totalDrinksThisSession();
			labelUnits.text = totals.numberUnits.toFixed(1);
		}
		
		function checkLevelUp(){
			if (!winCreated) {return;}
			Ti.API.debug('checkLevelUp');
			var labPoints = gameScores.TotalPoints(); 
			Ti.API.debug(JSON.stringify(labPoints));
			if (labPoints[0].Total > Ti.App.Properties.getInt('NextLevel',50)){
				Ti.API.debug('checkLevelUp2');
				var levelUpDialog = require('/ui/levelUpDialog');
				levelUpDialog.setParent(homeWin);
				levelUpDialog.levelUp( labPoints[0].Total);
				levelUpDialog.addEventListener('close', function(e){
					setTimeout(function(){
						dialogOpen = false;
						//alert('leveled up');
					}, 1000);
				});
				levelUpDialog.open();
			}
		}
		
		homeWin.refresh = function(){
			Ti.API.debug('homeWin refresh');
			rewriteSessionInfo();	
			rewriteUnitsBAC();	
			rewriteLabPoints();
			checkLevelUp();
			//every 10th call it tries to send data to boozerlyzer.net
			sendData.autoSync();
		};
		homeWin.refresh();
		
	
		Ti.API.debug('homeWin loaded');
		
		
		winCreated = true;
		return homeWin;
	}; 

