/**
 * @author Caspar Addyman
 * 
 * TThe graph plotting screen, which sends the data to a
 * webView which uses RGraph library to plot the results. 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {

	
	// The main screen for plotting results
	var win = Titanium.UI.currentWindow;
	Ti.include('/analysis/dataOverTime.js');
	//include the menu choices	
	Ti.include('/ui/menu.js');
	var menu = menus;
	//need to give it specific help for this screen
	menu.setHelpMessage("Chart plots drinks, blood alcohol and happiness levels over various time periods. Swipe upwards to access controls.");

	var  sizeAxisIcon = 48, reloadData;
	
	var SessionID = Titanium.App.Properties.getInt('SessionID');
	var personalInfo = Ti.App.boozerlyzer.db.personalInfo.getData();
	var stdDrinks = Ti.App.boozerlyzer.db.alcoholStandardDrinks.get(personalInfo.Country);
	var millsPerStandardUnits = stdDrinks[0].MillilitresPerUnit;

	//data variables
	var startTime, nTimeSteps, allDrinks, selfAssess;
	var timeAxis = Titanium.App.Properties.getString('GraphTimeAxis', 'Hourly Graph');
	Ti.API.debug('Charts - timeAxis ' + timeAxis);	
	
	function loadData(type){	
		if (type === "Hourly Graph"){		
			//All dose data for this session
			sessionData = Ti.App.boozerlyzer.db.sessions.getSession(SessionID);
			allDrinks = Ti.App.boozerlyzer.db.doseageLog.getAllSessionData(SessionID);
			selfAssess = Ti.App.boozerlyzer.db.selfAssessment.getAllSessionData(SessionID);
			startTime = sessionData[0].StartTime;
			nTimeSteps = 24;
		}else if (type === "Weekly Graph"){
			Ti.API.debug('Charts load week of data')
			//sessionData = Ti.App.boozerlyzer.db.sessions.getSession(SessionID);
			var aWeekAgo = parseInt((new Date()).getTime()/1000) - 3600 * 24 * 7;
			allDrinks = Ti.App.boozerlyzer.db.doseageLog.getTimeRangeData(aWeekAgo);
			selfAssess = Ti.App.boozerlyzer.db.selfAssessment.getTimeRangeData(aWeekAgo);
			startTime = aWeekAgo;
			nTimeSteps = 84;
		}
		reloadData  = false;
	}
	loadData(timeAxis);

	var webView = Ti.UI.createWebView({
		bottom:60,
		left:0,
		height:'auto',
		width:'auto',
		url:'/charts/chartSingleSession.html',
		zIndex:9
	});
	win.add(webView);
		
	// Attach an APP wide event listener	
	// it gets fired when the webView has finished loading
	Ti.App.addEventListener('webViewLoaded', function(e) {
		redrawGraph();
	});
	
	var time = Ti.UI.createImageView({
		image:'/icons/time.png',
		height:sizeAxisIcon,
		width:sizeAxisIcon,
		bottom:30,
		right:4,
		zIndex:10
	})
	win.add(time);	
	time.addEventListener('click', function(){
		//click on the time icon to toggle the time axis
		//and hence the type of graph we plot. 
		changeGraphTimeAxis();
		redrawGraph();
	});
	
	var labelWeeklyDailyGraph, controlsDrawn = false; 
	
	function drawGraphControls(){	
		if (controlsDrawn) { return;}
	
		labelWeeklyDailyGraph = Ti.UI.createLabel({
			title: 'Weekly Graph',
			font:{fontSize:12,fontWeight:'bold'},
			bottom : 90,
			right: 10,
			value:true,
			color:'black'
		});
		labelWeeklyDailyGraph.addEventListener('change', function(){
			changeGraphTimeAxis();
			redrawGraph();
		});
		win.add(labelWeeklyDailyGraph);
		controlsDrawn = true;
	}
	drawGraphControls();

	/**
	 * change from daily to hourly graph types.
	 * if a type is passed in use that otherwise
	 * toggle from current type to the other.
	 */
	function changeGraphTimeAxis(type){
		if (type === null || type === undefined){
			type = (labelWeeklyDailyGraph.text === "Weekly Graph" ? "Hourly Graph" :"Weekly Graph");
		}
		if (type === "Weekly Graph"){
			time.image = '/icons/calendar.png';
		}else {
			time.image = '/icons/time.png';
		}
		labelWeeklyDailyGraph.text = type;
		Titanium.App.Properties.setString('GraphTimeAxis', type);
		timeAxis = type;
		reloadData  = true; //need to reload the data next time we plot graph
	}
	changeGraphTimeAxis(timeAxis);
	
	function redrawGraph(){
		if (reloadData){
			loadData(timeAxis);
		}
		//webView has loaded so we can draw our chart
		var options = {
			plotDrinks:switchDrinks.value,
			plotBloodAlcohol:switchBloodAlcohol.value,
			plotHappiness:switchHappiness.value,
			plotEnergy:switchEnergy.value,
			plotDrunk:switchDrunk.value,
			//plotStroop:switchStroop.value,
			colDrinks:switchDrinks.color,
			colBloodAlcohol:switchBloodAlcohol.color,
			colHappiness:switchHappiness.color,
			colEnergy:switchEnergy.color,
			colDrunk:switchDrunk.color//,
			//colStroop:switchStroop.color
		};	
		var now = parseInt((new Date()).getTime()/1000);
		var timeSteps =	Ti.App.boozerlyzer.dateTimeHelpers.timeIntervals(nTimeSteps,startTime, now);
		var timeLabels = [];

		if (timeAxis === "Monthly Graph"){
			for (var t = 0;t< nTimeSteps;t++){
				//just show every 12th label
				if (t % 12 === 0){
					timeLabels[t] = Ti.App.boozerlyzer.dateTimeHelpers.formatDay(timeSteps[t]);			
				}
			}
			
		}else{
			var showMins = ((now - timeSteps[0]) < 12*3600); //show minutes if short session
			for (var t = 0;t< nTimeSteps;t++){
				//just show every 4th label
				if (t % 4 === 0){
					timeLabels[t] = Ti.App.boozerlyzer.dateTimeHelpers.formatTime(timeSteps[t],showMins,true);			
				}
			}
			
		}
		
	
		//Ti.API.debug('redrawGraph -allDrinks ' + JSON.stringify(allDrinks));
		var drinkSteps = drinksByTime(timeSteps,allDrinks,personalInfo, millsPerStandardUnits);
		Ti.API.debug('redrawGraph -selfAssess ' + JSON.stringify(selfAssess));
		var emotionSteps = emotionsByTime(timeSteps,selfAssess);
		//var stroopSteps = gameByTime(timeSteps,gameData);
		
		var myData =  JSON.stringify({
			options: options,
			timeLabels:timeLabels,
			//sessData: sessionData,
			selfData: emotionSteps, 			
			drinkData:drinkSteps	});
		
		webView.evalJS("paintLineChart('" + myData + "')");
	}
	

	//listen for errors from webView
	webView.addEventListener("error", function(e){
	    Ti.API.log("Error: " + e.message);
	//do something
	});
	
	// var yAxisTopIcon = Ti.UI.createImageView({
		// image:'/icons/whiskey.png',
		// height:sizeAxisIcon,
		// width:sizeAxisIcon,
		// top:10,
		// left:0
	// })
	// win.add(yAxisTopIcon);
// 	
	// var yAxisBottomIcon = Ti.UI.createImageView({
		// image:'/icons/whiskey-empty.png',
		// height:sizeAxisIcon * 0.7,
		// width:sizeAxisIcon * 0.7,
		// top:topAxis+heightAxis-axisInset,
		// left:0	
	// })
	// win.add(yAxisBottomIcon);
	
	
	// 
	// SOME TOGGLES FOR WHAT WE WILL DISPLAY
	//
	var switchDrinks = Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Drinks',
		font:{fontSize:12,fontWeight:'bold'},
		bottom :20,
		left: 60,
		value:true,
		color:'green'
	});
	switchDrinks.addEventListener('change', function(){
		redrawGraph();
	});
	win.add(switchDrinks);
	var switchBloodAlcohol = Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Blood Alcohol',
		font:{fontSize:12,fontWeight:'bold'},
		bottom :0,
		left: 60,
		value:true,
		color:'pink'
	});
	switchBloodAlcohol.addEventListener('change', function(){
		redrawGraph();
	});
	win.add(switchBloodAlcohol);
	
	var switchHappiness = Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Happiness',
		font:{fontSize:12,fontWeight:'bold'},
		bottom : 20,
		left: 166,
		value:true,
		color:'yellow'
	});
	switchHappiness.addEventListener('change', function(){
		redrawGraph();
	});
	win.add(switchHappiness);
	
	var switchEnergy = Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Energy',
		font:{fontSize:12,fontWeight:'bold'},
		bottom : 0,
		left: 166,
		value:true,
		color:'cyan'
	});
	switchEnergy.addEventListener('change', function(){
		redrawGraph();
	});
	win.add(switchEnergy);
	
	var switchDrunk = Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Drunkeness',
		font:{fontSize:12,fontWeight:'bold'},
		bottom :10,
		left: 266,
		value:true,
		color:'purple'
	});
	switchDrunk.addEventListener('change', function(){
		redrawGraph();
	});
	win.add(switchDrunk);

	//TODO find a nice way to include games on here?	
	// var switchStroop = Ti.UI.createSwitch({
		// style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		// title: 'Stroop score',
		// font:{fontSize:12,fontWeight:'bold'},
		// bottom : 10,
		// left: 320,
		// value:true,
		// color:'magenta'
	// });
	// switchStroop.addEventListener('change', function(){
		// redrawGraph();
	// });
	//win.add(switchStroop);
	
	var labelMenu = Ti.UI.createLabel({
		color:'white',
		font:{fontSize:14,fontFamily:'Helvetica Neue'},
		top:20,
		left:20,
		textAlign:'left',
		text:'Chart options..',
		height:'auto',
		width:'auto'
	});
	win.add(labelMenu);
	
	
	//cludge to implement vertical swipe on android
	var	webViewSwipeUpAnimation = Ti.UI.createAnimation({bottom:400,duration:500});
	var	webViewSwipeDownAnimation = Ti.UI.createAnimation({bottom:60,duration:500});
	var y_start;
	win.addEventListener('touchstart', function (e) {
	    y_start = e.y;
	});
	win.addEventListener('touchend', function (e) {
	    if (e.y - y_start > 20) {
	        swipe({direction: 'down'});
	    } else if (e.y - y_start < -20)  {
	        swipe({direction: 'up'});
	    }
	});
	 
	 // And then my swipe function:
	function swipe(e) {
	    if (e.direction == 'down') {
	    	Ti.API.debug("charts swipe down");
	       webView.animate(webViewSwipeDownAnimation);
	       webView.show();
	    } else { 
	    	Ti.API.debug("charts swipe up");
	       webView.animate(webViewSwipeUpAnimation);
	    }
	}
	
	
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (Ti.App.boozerlyzer.winHome === undefined 
			 || Ti.App.boozerlyzer.winHome === null) {
			Ti.App.boozerlyzer.winHome = Titanium.UI.createWindow({ modal:true,
				url: '/app.js',
				title: 'Boozerlyzer',
				backgroundImage: '/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			})
		}
		win.close();
		Ti.App.boozerlyzer.winHome.open();
	});
})();