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
	
	
	//size of axis object
	var topAxis = 10;
	var leftAxis = 30;
	var sizeDataPoint = 24;
	var sizeAxisIcon = 48;
	var widthAxis = 360;	
	var heightAxis = 216;
	var axisInset = 18;  //how far inset is the origin?
	
	
	//load up all the data
	var SessionID = Titanium.App.Properties.getInt('SessionID');
	var personalInfo = Ti.App.boozerlyzer.data.personalInfo.getData();
//	var Countries = Ti.App.boozerlyzer.data.alcoholStandardDrinks.get();

	var sessionData = Ti.App.boozerlyzer.data.sessions.getSession(SessionID);
	//All dose data for this session
	var allDrinks = Ti.App.boozerlyzer.data.doseageLog.getAllSessionData(SessionID);
	var selfAssess = Ti.App.boozerlyzer.data.selfAssessment.getAllSessionData(SessionID);
	var stdDrinks = Ti.App.boozerlyzer.data.alcoholStandardDrinks.get(personalInfo.Country);
	var millsPerStandardUnits = stdDrinks[0].MillilitresPerUnit;

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
	
	/**
	 * change from daily to hourly graph types.
	 * if a type is passed in use that otherwise
	 * toggle from current type to the other.
	 */
	function changeGraphTimeAxis(type){
		if (type === null || type === undefined){
			type = (switchMonthlyDailyGraph.text === "Monthly Graph" ? "Hourly Graph" :"Monthly Graph");
		}
	}
	
	function redrawGraph(){
		
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
		var timeSteps =	Ti.App.boozerlyzer.dateTimeHelpers.timeIntervals(24,sessionData[0].StartTime, now);
		var timeLabels = [];

		var showMins = ((now - timeSteps[0]) < 12*3600); //show minutes if short session
		var nsteps = timeSteps.length;
		for (var t = 0;t< nsteps;t++){
			//just show every 4th label
			if (t % 4 === 0){
				timeLabels[t] = Ti.App.boozerlyzer.dateTimeHelpers.formatTime(timeSteps[t],showMins,true);			
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
			sessData: sessionData,
			selfData: emotionSteps, 			
			drinkData:drinkSteps	});
		
		webView.evalJS("paintLineChart('" + myData + "')");
	}
	

	//listen for errors from webView
	webView.addEventListener("error", function(e){
	    Ti.API.log("Error: " + e.message);
	//do something
	});
	
	var yAxisTopIcon = Ti.UI.createImageView({
		image:'/icons/whiskey.png',
		height:sizeAxisIcon,
		width:sizeAxisIcon,
		top:topAxis,
		left:0
	})
	win.add(yAxisTopIcon);
	
	var yAxisBottomIcon = Ti.UI.createImageView({
		image:'/icons/whiskey-empty.png',
		height:sizeAxisIcon * 0.7,
		width:sizeAxisIcon * 0.7,
		top:topAxis+heightAxis-axisInset,
		left:0	
	})
	win.add(yAxisBottomIcon);
	
	var time = Ti.UI.createImageView({
		image:'/icons/time.png',
		height:sizeAxisIcon,
		width:sizeAxisIcon,
		top:topAxis+heightAxis,
		right:4	
	})
	win.add(time);
	
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
	    	Ti.API.debug('charts swipe down');
	       webView.animate(webViewSwipeDownAnimation);
	       webView.show();
	    } else { 
	    	Ti.API.debug('charts swipe up');
	       webView.animate(webViewSwipeUpAnimation);
	    }
	}
	
	var switchMonthlyDailyGraph, controlsDrawn = false; 
	
	function drawGraphControls(){	
		if (controlsDrawn) { return;}
	
		switchMonthlyDailyGraph = Ti.UI.createSwitch({
			style : Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON,
			title: 'Monthly Graph',
			font:{fontSize:12,fontWeight:'bold'},
			bottom : 90,
			right: 10,
			value:true,
			color:'black'
		});
		switchMonthlyDailyGraph.addEventListener('change', function(){
			changeGraphTimeAxis();
			redrawGraph();
		});
		win.add(switchMonthlyDailyGraph);
		controlsDrawn = true;
	}
	
	
	//
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