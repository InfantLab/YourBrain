/**
 * @author Caspar Addyman
 * 
 * The user interface for the main screen of the boozerlyzer app.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

	Ti.API.debug('homeWin 0');

	//Create sub-namespace
//	Boozerlyzer.win.main = {};
	var dbAlias = Boozerlyzer.db;
	var dataAlias = Boozerlyzer.data;
	var commAlias = Boozerlyzer.comm;
	
	//Create the main application window
	exports.createApplicationWindow = function(_args) {
		//the start screen for the YBOB boozerlyzer
		var homeWin = Titanium.UI.createWindow({
			exitOnClose: true,
			title:'YBOB Boozerlyzer',
			backgroundImage:'/images/smallcornercup.png'
		});
		
		var levelUpDialog = require('/ui/levelUpDialog');
		//Ti.include('/ui/levelUpDialog.js');
		//include the menu choices	
		// var menu = menus;
		var menu = require('/ui/menu');
		
		//need to give it specific help for this screen
		menu.setHelpMessage("Click on the icons to add new drinks, launch games, etc.");
		
		//reset to main user and MateMode flag.
		Titanium.App.Properties.setInt('UserID',0);
		Titanium.App.Properties.setBool('MateMode',false); 

			
		homeWin.orientationModes = [
		    Titanium.UI.LANDSCAPE_LEFT,
		    Titanium.UI.LANDSCAPE_RIGHT
		];
		// Titanium.UI.orientation = Titanium.UI.LANDSCAPE_LEFT;
		
		var loadedonce = false;
		
		// layout variables
		var bigIcons = 76, leftAppName = 20, leftNewDrinks = 20, leftEmotion = 100, leftTripReport = 180, leftGame = 240;
		var topNewDrinks = 80, topEmotion = 80, topTripReport = 80, topGame = 80, topHighScores = 160, leftHighScores = 100, topLabPoints = 160;
		var leftLabPoints =20, topResults = 80, leftResults = 340, optionsLeft = 320;
		
		
		
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
			color:'#888',
			text:'Version: '+ Titanium.App.getVersion(),
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			top:53,
			left:leftAppName
		});
		homeWin.add(labelVers);
		
		var labelCredits = Titanium.UI.createLabel({
			autoLink : Ti.UI.Android.LINKIFY_ALL,
			color:'#000',
			text:'Created by  ' + Titanium.App.getURL() + '\nBuilt with  http://appcelerator.com',
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			right:00,
			width:240,
			bottom:0
		});
		homeWin.add(labelCredits);
		
		var personalinfo = Titanium.UI.createImageView({
			image:'/icons/safe.png',
			height:48,
			width:48,
			top:20,
			left:optionsLeft
		});
		personalinfo.addEventListener('click',function(){
			menu.showSettingsScreen();
		});
		homeWin.add(personalinfo);
		var labelMateMode = Titanium.UI.createLabel({
			text:'Mate Mode',
			top:80,
			left:optionsLeft + 52,
			visible:false
		});
		homeWin.add(labelMateMode);
		var matemode = Titanium.UI.createImageView({
			image:'/icons/Chorus.png',
			height:48,
			width:48,
			top:20,
			left:optionsLeft + 52
		});
		//matemode.opacity = 0.5;
			
		//if we click this icon toggle between normal use
		//and mate mode where scores don't count towards your own total.
		matemode.addEventListener('click', function(){
			swapMateMode();		
		});
		homeWin.add(matemode);
		
		function swapMateMode(){
			if (Titanium.App.Properties.getBool('MateMode',false)){
				//switch back into regular mode
				dataAlias.session = dbAlias.sessions.getLatestData(0);
				//retrieve current session
				Titanium.App.Properties.setBool('MateMode', false);			//set to false
				Titanium.App.Properties.setInt('SessionID',dataAlias.session[0].ID);
				Titanium.App.Properties.setInt('UserID', dataAlias.session[0].UserID);				
				Ti.API.debug("Switch out of mate mode - session info:" + JSON.stringify(dataAlias.session));
				var shrink = Ti.UI.create2DMatrix();
				shrink.scale(0.5);
				mateModeOffAnimation = Ti.UI.createAnimation({transform:shrink, opacity:0.5});
				matemode.animate(mateModeOffAnimation);
				labelMateMode.visible = false;
				homeWin.backgroundImage = '/images/smallcornercup.png';
			}else{
				//set properties
				Titanium.App.Properties.setBool('MateMode', true);
				//switch into mate mode.. create a new session.
				dataAlias.session = dbAlias.sessions.createNewSession(Titanium.App.Properties.getBool('MateMode',false));
				Titanium.App.Properties.setInt('SessionID', dataAlias.session[0].ID);
				Titanium.App.Properties.setInt('UserID', dataAlias.session[0].UserID);
				Ti.API.debug("Switch into mate mode - session info:" + JSON.stringify(dataAlias.session));
				var grow = Ti.UI.create2DMatrix();
				grow.scale(2);
				mateModeOnAnimation = Ti.UI.createAnimation({transform:grow, opacity:0.99});
				matemode.animate(mateModeOnAnimation);
				//matemode.opacity = 1;
				homeWin.backgroundImage = '/images/smallcornercup.matemode.png';
				labelMateMode.visible = true;
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
			// if (!Boozerlyzer.winBugReport ){
				Boozerlyzer.winBugReport = Boozerlyzer.win.tripReport.createApplicationWindow('BUG');
				Boozerlyzer.winBugReport.home = homeWin; //reference to home
				Boozerlyzer.winBugReport.addEventListener('close',homeWin.refresh)			
			// }
			Boozerlyzer.winBugReport.open();
		});
		homeWin.add(newbugreport);	
			
		var report = Titanium.UI.createImageView({
			image:'/icons/ybob-logo2-sml.png',
			height:160,
			width:140,
			top:topResults,
			left:leftResults
		});
		
		report.addEventListener('click',function(){
			// if (!Boozerlyzer.winCharts ){
				Boozerlyzer.winCharts = Boozerlyzer.win.charts.createApplicationWindow();
				Boozerlyzer.winCharts.home = homeWin; //reference to home
				Boozerlyzer.winCharts.addEventListener('close',homeWin.refresh);				
			// }
			Boozerlyzer.winCharts.open();
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
			// if (!Boozerlyzer.winDrinks ){
				Boozerlyzer.winDrinks = Boozerlyzer.win.drinks.createApplicationWindow();
				Boozerlyzer.winDrinks.home = homeWin; //reference to home
				Boozerlyzer.winDrinks.addEventListener('close',homeWin.refresh);				
			// }
			Boozerlyzer.winDrinks.open();
			// homeWin.hide();
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
			Boozerlyzer.winEmotion = Boozerlyzer.win.emotion.createApplicationWindow();
			Boozerlyzer.winEmotion.home = homeWin; //reference to home
			Boozerlyzer.winEmotion.addEventListener('close',homeWin.refresh);			
			Boozerlyzer.winEmotion.open();
			// Boozerlyzer.winEmotion.reopenWindow();
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
			// if (!Boozerlyzer.winTripReport){
				Boozerlyzer.winTripReport = Boozerlyzer.win.tripReport.createApplicationWindow('TRIP');
				Boozerlyzer.winTripReport.home = homeWin; //reference to home
				Boozerlyzer.winTripReport.addEventListener('close',homeWin.refresh);
			// }
			Boozerlyzer.winTripReport.open();
			// homeWin.hide();
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
			// if (!Boozerlyzer.winGameMenu || Boozerlyzer.winGameMenu === undefined){
				Boozerlyzer.winGameMenu = Boozerlyzer.win.gameMenu.createApplicationWindow();
				Boozerlyzer.winGameMenu.home = homeWin; //reference to home
				Boozerlyzer.winGameMenu.addEventListener('close',homeWin.refresh);
			// }
			Boozerlyzer.winGameMenu.open();
		});
		homeWin.add(newgame);

		var labelHighScores = Titanium.UI.createLabel({
			text:'High Scores',
			font:{fontSize:24,fontFamily:'sans-serif',fontWeight:'bold'},
			textAlign:'center',
			height:bigIcons,
			width:bigIcons * 2.9,
			top:topHighScores,
			left:leftHighScores,
			color:'green',
			zIndex:0,
		});
		homeWin.add(labelHighScores);
		
		
		var highScores = Titanium.UI.createImageView({
			image:'/icons/Evolution.png',
			height:bigIcons,
			width:bigIcons * 2.9,  //keep correct proportions
			top:topHighScores,
			left:leftHighScores,
			opacity:0.3
		});
		highScores.addEventListener('click',function(){
			//add a close event listener which will refresh homescreen
			//see http://developer.appcelerator.com/question/49971/giving-parent-window-focus-after-modal-closes
			// if (!Boozerlyzer.winHighScores || Boozerlyzer.winHighScores === undefined){
				Boozerlyzer.winHighScores = Boozerlyzer.win.HighScores.createApplicationWindow();
				Boozerlyzer.winHighScores.home = homeWin; //reference to home
				Boozerlyzer.winHighScores.addEventListener('close',homeWin.refresh);
			// }
			Boozerlyzer.winHighScores.open();
		});
		homeWin.add(highScores);

		var labelLabPoints = Titanium.UI.createLabel({
			text:'0000',
			font:{fontSize:28,fontFamily:'Helvetica Neue'},
			textAlign:'left',
			height:32,
			width:140,
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
		
		
		var labelCurrentSession = Titanium.UI.createLabel({
			text:'Session started\n Sat 3th, 12:00pm',
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			left:leftNewDrinks + 36,
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
			left:leftNewDrinks + 36,
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
			var timeSinceUpdate = Boozerlyzer.dateTimeHelpers.prettyDate(dataAlias.session[0].LastUpdate);
			labelLastUpdate.text = 'Last activity\n' + timeSinceUpdate;
			labelCurrentSession.text = 'Session Started\n' + Boozerlyzer.dateTimeHelpers.formatDayPlusTime(dataAlias.session[0].StartTime,true);
			Ti.API.debug('Session ID - ' + dataAlias.session[0].ID);
			Titanium.App.Properties.setInt('SessionID', dataAlias.session[0].ID);
			Titanium.App.Properties.setInt('SessionStart',dataAlias.session[0].StartTime/1000);
			Titanium.App.Properties.setInt('SessionChanged',dataAlias.session[0].LastUpdate/1000);
		
		}

		var newSessionDialog = Titanium.UI.createOptionDialog({
			options:['New session', 'Continue..'],
			destructive:2,
			cancel:1,
			title:'Start a new session?'
		});
		// add event listener
		newSessionDialog.addEventListener('click',function(e)
		{
			if (e.index === 0) {
				dataAlias.session = dbAlias.sessions.createNewSession(false);
				rewriteSessionInfo();
				labelCurrentSession.text = 'Session Started\n' + Boozerlyzer.dateTimeHelpers.formatDayPlusTime(dataAlias.session[0].StartTime,true);
			}
		});

		//what is the current session? 
		//if last update was >36 hours ago automatically start new session
		//if last update was >12 hours ago ask if what to start new session
		//if last update was <12 hours ago continue that session[0].
		if (dataAlias.session === undefined){
			dataAlias.session = dbAlias.sessions.getLatestData(0);
			if (dataAlias.session === null || dataAlias.session === false){
				dataAlias.session = dbAlias.sessions.createNewSession(false);
			}
				
		}
		Titanium.API.debug("session info: " + JSON.stringify(dataAlias.session));
		var now = parseInt((new Date()).getTime()/1000, 10);
		if (now - dataAlias.session[0].LastUpdate  <43200){ 
			//less than 12hours - carry on 
		}else if (now - dataAlias.session[0].LastUpdate < 129600){ //36 hours
			var timeSinceUpdate = Boozerlyzer.dateTimeHelpers.prettyDate(dataAlias.session[0].LastUpdate);
			newSessionDialog.title = 'Last update ' + timeSinceUpdate + '\nStart a new session?';
			newSessionDialog.show();
		}else{
			//>36 hours since last update, don't ask just start new
			dataAlias.session = dbAlias.sessions.createNewSession(false);
		} 
		Ti.API.debug('homeWin 3');

		//updates the lab points counter
		function rewriteLabPoints(){
			Ti.API.debug('rewriteLabPoints');
			var labPoints = dbAlias.gameScores.TotalPoints(); 
			// if (isNaN(labPoints[0].Total)){
				// labelLabPoints.text = 'Err';
			// }
			// else{
				labelLabPoints.text = labPoints[0].Total.toFixed(0); //+ ' Pts';	
				
			// }
		}
		
		function checkLevelUp(){
			if (!loadedonce) {return;}
			Ti.API.debug('checkLevelUp');
			var labPoints = dbAlias.gameScores.TotalPoints(); 
			Ti.API.debug(JSON.stringify(labPoints));
			if (labPoints[0].Total > Ti.App.Properties.getInt('NextLevel',50)){
				Ti.API.debug('checkLevelUp2');
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

		
		//every 10th call it tries to send data to boozerlyzer.net
		function autoSendData(){
			commAlias.sendData.autoSync();
		}
		
		homeWin.refresh = function(){
			Ti.API.debug('homeWin refresh');
			rewriteSessionInfo();		
			rewriteLabPoints();
			checkLevelUp();
			autoSendData();
		};

		homeWin.refresh();
		loadedonce = true;
		Ti.API.debug('homeWin 7');

		homeWin.addEventListener('homeWinRefresh',homeWin.refresh);
				
		homeWin.addEventListener('focused', function(){
			Ti.API.debug('homeWin got focus');
			if (loadedonce){
				//this code only runs when we reload this page
				homeWin.refresh();
			}
		});
		Ti.API.debug('homeWin 0');
		return homeWin;


	};
	// } catch (err) {
	    // Ti.API.error(err);
	// }
// })();

