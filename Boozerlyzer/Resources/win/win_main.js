/**
 * @author Caspar Addyman
 * 
 * The user interface for the main screen of the boozerlyzer app.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {
	try{
	Ti.API.debug('homeWin 0');

	//Create sub-namespace
	Ti.App.boozerlyzer.win.main = {};
	var dbAlias = Ti.App.boozerlyzer.db;
	var dataAlias = Ti.App.boozerlyzer.data;
	
	//Create the main application window
	Ti.App.boozerlyzer.win.main.createApplicationWindow = function(_args) {
		//include the menu choices	
		Ti.include('/ui/menu.js');
		var menu = menus;
		//need to give it specific help for this screen
		menu.setHelpMessage("Click on the icons to add new drinks, launch games, etc.");
		
		//reset to main user and MateMode flag.
		Titanium.App.Properties.setInt('UserID',0);
		Titanium.App.Properties.setBool('MateMode',false); 
		//the start screen for the YBOB boozerlyzer
		var homeWin = Titanium.UI.createWindow({
			exitOnClose: true,
			title:'YBOB Boozerlyzer',
			backgroundImage:'/images/smallcornercup.png'
		});
			
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
			var newtripwin = Titanium.UI.createWindow({ modal:true,
				url:'/win/win_tripreport.js',
				title:'How are you feeling?',
				backgroundImage:'/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT],  //Landscape mode only
				type: 'BUG' //need this because same code used for trip report screen
				});
			newtripwin.home = homeWin; //reference to home
			newtripwin.open();
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
			var winreport = Titanium.UI.createWindow({ modal:true,
				url:'/win/win_charts.js',
				title:'Personal Information',
				backgroundImage:'/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
				});
			winreport.home = homeWin; //reference to home
			winreport.open();
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
			var newdosewin = Titanium.UI.createWindow({ modal:true,
				url:'/win/win_drinks.js',
				title:'What have you had to drink?',
				backgroundImage:'/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});
			newdosewin.home = homeWin; //reference to home
			newdosewin.open();
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
			var newmoodwin = Titanium.UI.createWindow({ 
			modal:true,
				url:'/win/win_emotion.js',
				title:'How are you feeling?',
				backgroundImage:'/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
				});
			newmoodwin.home = homeWin; //reference to home
			newmoodwin.open();
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
			var newtripwin = Titanium.UI.createWindow({ modal:true,
				url:'/win/win_tripreport.js',
				title:'How are you feeling?',
				backgroundImage:'/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT],  //Landscape mode only
				type: 'TripReport' //need this because same code used for bug report screen

				});
			newtripwin.home = homeWin; //reference to home
			newtripwin.open();
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
			var winplay = Titanium.UI.createWindow({ modal:true,
				url:'/win/win_gameMenu.js',
				title:'YBOB Game Menu',
				backgroundImage:'/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
				});
			winplay.home = homeWin; //reference to home
			winplay.open();
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
			var highscoreswin = Titanium.UI.createWindow({ modal:true,
				url:'/win/win_highScores.js',
				title:'What have you had to drink?',
				backgroundImage:'/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});
			highscoreswin.home = homeWin; //reference to home
			highscoreswin.open();
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

		//what is the current session? 
		//if last update was >36 hours ago automatically start new session
		//if last update was >12 hours ago ask if what to start new session
		//if last update was <12 hours ago continue that session[0].
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
				rewriteUpdateLabel();
				labelCurrentSession.text = 'Session Started\n' + Ti.App.boozerlyzer.dateTimeHelpers.formatDayPlusTime(dataAlias.session[0].StartTime,true);
			}
		});
		
		
		if (dataAlias.session === undefined){
			dataAlias.session = dbAlias.sessions.getLatestData(0);
			if (dataAlias.session === null 
			|| dataAlias.session === false){
				dataAlias.session = dbAlias.sessions.createNewSession(false);
			}
				
		}
		var timeSinceUpdate = Ti.App.boozerlyzer.dateTimeHelpers.prettyDate(dataAlias.session[0].LastUpdate);

		function rewriteUpdateLabel(){
			Ti.API.debug('rewriteUpdateLabel');
			timeSinceUpdate = Ti.App.boozerlyzer.dateTimeHelpers.prettyDate(dataAlias.session[0].LastUpdate);
			labelLastUpdate.text = 'Last activity\n' + timeSinceUpdate;
		
		}
		Ti.API.debug('homeWin 3');

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
		
		Ti.API.debug('homeWin 4');
		rewriteUpdateLabel();
		rewriteLabPoints();
		Ti.API.debug('homeWin 5');

		Titanium.API.debug("session info: " + JSON.stringify(dataAlias.session));
		var now = parseInt((new Date()).getTime()/1000);
		if (now - dataAlias.session[0].LastUpdate  <43200){ //12hours
		}else if (now - dataAlias.session[0].LastUpdate < 129600){ //36 hours
			newSessionDialog.title = 'Last update ' + timeSinceUpdate + '\nStart a new session?';
			newSessionDialog.show();
		}else{
			//>36 hours since last update, don't ask just start new
			dataAlias.session = dbAlias.sessions.createNewSession(false);
		} 
		Ti.API.debug('homeWin 6');
		rewriteUpdateLabel();
		labelCurrentSession.text = 'Session Started\n' + Ti.App.boozerlyzer.dateTimeHelpers.formatDayPlusTime(dataAlias.session[0].StartTime,true);
		Ti.API.debug('Session ID - ' + dataAlias.session[0].ID);
		Titanium.App.Properties.setInt('SessionID', dataAlias.session[0].ID);
		Titanium.App.Properties.setInt('SessionStart',dataAlias.session[0].StartTime/1000);
		Titanium.App.Properties.setInt('SessionChanged',dataAlias.session[0].LastUpdate/1000);
		
		loadedonce = true;
		Ti.API.debug('homeWin 7');

		homeWin.refresh = function(){
			Ti.API.debug('homeWin refresh');
    	    rewriteUpdateLabel();		
			rewriteLabPoints();
		}
				
		homeWin.addEventListener('focused', function(){
			Ti.API.debug('homeWin got focus');
			if (loadedonce){
				//this code only runs when we reload this page
				Ti.App.boozerlyzer.win.main.refresh();
			}
		});
		Ti.API.debug('homeWin 0');
		return homeWin;


	};
	} catch (err) {
	    Ti.API.error(err);
	}
})();

