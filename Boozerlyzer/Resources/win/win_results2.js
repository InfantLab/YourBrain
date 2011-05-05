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
	var winHome = win.home;
	
	
	//size of axis object
	var topAxis = 10;
	var leftAxis = 30;
	var sizeDataPoint = 24;
	var sizeAxisIcon = 48;
	var widthAxis = 360;	
	var heightAxis = 216;
	var axisInset = 18;  //how far inset is the origin?
	
	
	var SessionID = Titanium.App.Properties.getInt('SessionID');
	
	var sessionData = Titanium.App.boozerlyzer.data.sessions.getSession(SessionID);
	//All dose data for this session
	var AllDrinks = Titanium.App.boozerlyzer.data.doseageLog.getDataArray_TimeUnits(SessionID);
	var selfAssess = Titanium.App.boozerlyzer.data.selfAssessment.getAllSessionData(SessionID);
	
	Ti.API.debug('win results selfAssess' + JSON.stringify(selfAssess));
	
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
		var myData =  JSON.stringify({
			options: options,
			sessData: sessionData,
			selfData: selfAssess, 			
			drinkData:AllDrinks	});
		
		webview.evalJS("paintScatterChart('" + myData + "')");
	
	}
	
	var webview = Ti.UI.createWebView({
		bottom:60,
		left:0,
		height:'auto',
		width:'auto',
		url:'../charts/chartSingleSession.html'
	});
	win.add(webview);
	
	
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