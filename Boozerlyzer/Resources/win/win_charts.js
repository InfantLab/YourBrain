/**
 * @author Caspar Addyman
 * 
 * TThe graph plotting screen, which sends the data to a
 * webview which uses RGraph library to plot the results. 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {
	
	// The main screen for plotting results
	var win = Titanium.UI.currentWindow;
	Ti.include('../analysis/dataOverTime.js');
	
	
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
	var personalInfo = Titanium.App.boozerlyzer.data.personalInfo.getData();
//	var Countries = Titanium.App.boozerlyzer.data.alcoholStandardDrinks.get();

	var sessionData = Titanium.App.boozerlyzer.data.sessions.getSession(SessionID);
	//All dose data for this session
	var allDrinks = Titanium.App.boozerlyzer.data.doseageLog.getAllSessionData(SessionID);
	var selfAssess = Titanium.App.boozerlyzer.data.selfAssessment.getAllSessionData(SessionID);
	var stdDrinks = Ti.App.boozerlyzer.data.alcoholStandardDrinks.get(personalInfo.Country);
	var millsPerStandardUnits = stdDrinks[0].MillilitresPerUnit;

	
	// Attach an APP wide event listener	
	// it gets fired when the webView has finished loading
	Ti.App.addEventListener('webViewLoaded', function(e) {
		redrawGraph();
	});
	
	function redrawGraph(){
		//webview has loaded so we can draw our chart
		var options = {
			plotDrinks:switchDrinks.value,
			plotHappiness:switchHappiness.value,
			plotEnergy:switchEnergy.value,
			plotDrunk:switchDrunk.value,
			plotStroop:switchStroop.value
		};	
		var now = parseInt((new Date()).getTime()/1000);
		var timeSteps =	Titanium.App.boozerlyzer.dateTimeHelpers.timeIntervals(24,sessionData[0].StartTime, now);
		var timeLabels = [];

		var showMins = ((now - timeSteps[0]) < 12*3600); //show minutes if short session
		for (var t = 0;t< timeSteps.length;t++){
			timeLabels[t] = Titanium.App.boozerlyzer.dateTimeHelpers.formatTime(timeSteps[t],showMins,true);
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
		
		webview.evalJS("paintLineChart('" + myData + "')");
	
	}
	
	var webview = Ti.UI.createWebView({
		bottom:60,
		left:0,
		height:'auto',
		width:'auto',
		url:'../charts/chartSingleSession.html'
	});
	win.add(webview);
	
	//listen for errors from webview
	webview.addEventListener("error", function(e){
	    Ti.API.log("Error: " + e.message);
	//do something
	});
	
	var fast = Ti.UI.createImageView({
		image:'../icons/rocket.png',
		height:sizeAxisIcon,
		width:sizeAxisIcon,
		top:topAxis,
		left:0
	})
	win.add(fast);
	
	var slow = Ti.UI.createImageView({
		image:'../icons/snail.png',
		height:sizeAxisIcon,
		width:sizeAxisIcon,
		top:topAxis+heightAxis-axisInset,
		left:0	
	})
	win.add(slow);
	
	var time = Ti.UI.createImageView({
		image:'../icons/time.png',
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
		font:{fontSize:12},
		bottom :10,
		left: 60,
		value:true
	});
	switchDrinks.addEventListener('change', function(){
		redrawGraph();
	});
	win.add(switchDrinks);
	
	var switchHappiness = Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Happiness',
		font:{fontSize:12},
		bottom : 20,
		left: 126,
		value:true
	});
	switchHappiness.addEventListener('change', function(){
		redrawGraph();
	});
	win.add(switchHappiness);
	
	var switchEnergy = Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Energy',
		font:{fontSize:12},
		bottom : 0,
		left: 126,
		value:true
	});
	switchEnergy.addEventListener('change', function(){
		redrawGraph();
	});
	win.add(switchEnergy);
	
	var switchDrunk = Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Drunkeness',
		font:{fontSize:12},
		bottom :10,
		left: 220,
		value:true
	});
	switchDrunk.addEventListener('change', function(){
		redrawGraph();
	});
	win.add(switchDrunk);
	
	var switchStroop = Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Stroop score',
		font:{fontSize:12},
		bottom : 10,
		left: 320,
		value:true
	});
	switchStroop.addEventListener('change', function(){
		redrawGraph();
	});
	win.add(switchStroop);
	
	
	
	//
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
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
})();