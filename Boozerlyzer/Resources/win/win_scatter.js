/**
 * @author Caspar Addyman
 * 
 * The graph plotting screen, which sends the data to a
 * webView which uses RGraph library to plot the results. 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

	exports.createApplicationWindow = function(){
		var win = Titanium.UI.createWindow({
			title:'YBOB Boozerlyzer',
			backgroundImage:'/images/smallcornercup.png',
			modal:true
			});	
		win.orientationModes =  [Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];	

		var winHome, gameData, reloadData;
		var  sizeAxisIcon = 48;
	
		//add the appropriate requires	
		var dataObject = require('/db/dataObject');
		var gameScores = require('/db/gameScores');
		var menu = require('/ui/menu');
		//include the menu choices	
		//need to give it specific help for this screen
		menu.setHelpContext(Titanium.Android.currentActivity);
		menu.setHelpMessage("Chart plots game scores against current blood alcohol. Swipe upwards to access controls.");
		
		
		//data variables
		var xAxis = Titanium.App.Properties.getString('GraphScatterX', 'Blood Alcohol');
		var yAxis = Titanium.App.Properties.getString('GraphScatterY', 'Happiness');
		Ti.API.debug('Charts - xAxis ' + xAxis);	
		
		function loadData(){	
			gameData = gameScores.GamePlaySummary(null, null, null, true);
			reloadData  = false;
		}
		
		var webView = Ti.UI.createWebView({
			bottom:60,
			left:0,
			height:'auto',
			width:'auto',
			url:'/charts/chartScatterSelfAssessment.html',
			zIndex:9
		});
		win.add(webView);			
		webView.addEventListener('load', function(e) {
		    // code that fires AFTER webview has loaded
		    redrawGraph();
		 });
		
		var xAxisIcon = Ti.UI.createImageView({
			image:'/icons/teddy_bears.png',
			height:sizeAxisIcon,
			width:sizeAxisIcon,
			bottom:30,
			right:4,
			zIndex:10
		});
		win.add(xAxisIcon);	
		xAxisIcon.addEventListener('click', function(){
			//click on the time icon to toggle the time axis
			//and hence the type of graph we plot. 
			changeXAxisIcon();
			redrawGraph();
		});
		
		var labelWeeklyDailyGraph, controlsDrawn = false; 
		
		function drawGraphControls(){	
			//appdebugsteps +='drawGraphControls ..';
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
				changeXAxisIcon();
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
		function changeXAxisIcon(){
			var	type = (labelWeeklyDailyGraph.text === "Weekly Graph" ? "Hourly Graph" :"Weekly Graph");
			if (type === "Weekly Graph"){
				xAxisIcon.image = '/icons/calendar.png';
			}else {
				xAxisIcon.image = '/icons/time.png';
			}
			labelWeeklyDailyGraph.text = type;
			Titanium.App.Properties.setString('GraphScatterX', type);
			xAxis = type;
			reloadData  = true; //need to reload the data next time we plot graph
		}
		changeXAxisIcon();
		
		function redrawGraph(){
			if (reloadData){
				loadData();
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
				colDrunk:switchDrunk.color,
				//colStroop:switchStroop.color
				MillsPerStandardDrink:dataObject.getStandardDrinks()
			};

			
			var myData =  JSON.stringify({
				options: options,
				drinkData:gameData.Alcohol_ml,
				bloodAlcohol:gameData.BloodAlcoholConc,
				happiness:gameData.Happiness,
				energy:gameData.Energy,
				drunkeness:gameData.Drunkeness   			
			}); 
			webView.evalJS("paintScatterChart('" + myData + "')");
		// } catch (err) {
		    // alert('chart redraw error ' + err.description);
		// }
		}
		
		
		//listen for errors from webView
		webView.addEventListener("error", function(e){
		    Ti.API.log("Error: " + e.message);
		//do something
			alert('Charting error ' + e.message);
		});
	
		
		
		// 
		// SOME TOGGLES FOR WHAT WE WILL DISPLAY
		//
		var switchDrinks = Ti.UI.createSwitch({
			style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
			title: 'Drinks',
			font:{fontSize:12,fontWeight:'bold'},
			bottom :20,
			left: 60,
			value:Ti.App.Properties.getBool('switchDrinks',true),
			color:'green'
		});
		switchDrinks.addEventListener('change', function(){
			Ti.App.Properties.setBool('switchDrinks', switchDrinks.value);
			redrawGraph();
		});
		win.add(switchDrinks);
		var switchBloodAlcohol = Ti.UI.createSwitch({
			style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
			title: 'Blood Alcohol',
			font:{fontSize:12,fontWeight:'bold'},
			bottom :0,
			left: 60,
			value:Ti.App.Properties.getBool('switchBloodAlcohol',true),
			color:'pink'
		});
		switchBloodAlcohol.addEventListener('change', function(){
			Ti.App.Properties.setBool('switchBloodAlcohol', switchBloodAlcohol.value);
			redrawGraph();
		});
		win.add(switchBloodAlcohol);
		
		var switchHappiness = Ti.UI.createSwitch({
			style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
			title: 'Happiness',
			font:{fontSize:12,fontWeight:'bold'},
			bottom : 20,
			left: 166,
			value:Ti.App.Properties.getBool('switchHappiness',true),
			color:'yellow'
		});
		switchHappiness.addEventListener('change', function(){
			Ti.App.Properties.setBool('switchHappiness', switchHappiness.value);
			redrawGraph();
		});
		win.add(switchHappiness);
		
		var switchEnergy = Ti.UI.createSwitch({
			style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
			title: 'Energy',
			font:{fontSize:12,fontWeight:'bold'},
			bottom : 0,
			left: 166,
			value:Ti.App.Properties.getBool('switchEnergy',true),
			color:'cyan'
		});
		switchEnergy.addEventListener('change', function(){
			Ti.App.Properties.setBool('switchEnergy', switchEnergy.value);
			redrawGraph();
		});
		win.add(switchEnergy);
		
		var switchDrunk = Ti.UI.createSwitch({
			style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
			title: 'Drunkeness',
			font:{fontSize:12,fontWeight:'bold'},
			bottom :10,
			left: 266,
			value:Ti.App.Properties.getBool('switchDrunk',true),
			color:'purple'
		});
		switchDrunk.addEventListener('change', function(){
			Ti.App.Properties.setBool('switchDrunk', switchDrunk.value);
			redrawGraph();
		});
		win.add(switchDrunk);
		
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
		 // And then my swipe function:
		function swipe(e) {
			Ti.API.debug('webview swipe - e.direction ' + e.direction );
		    if (e.direction === 'down') {
				Ti.API.debug("charts swipe down");
				webView.animate(webViewSwipeDownAnimation);
				webView.show();
		    } else { 
				Ti.API.debug("charts swipe up");
				webView.animate(webViewSwipeUpAnimation);
		    }
		}
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
		 
		
		
	//TODO
	//There ought to be a simple way of wrapping this up as a UI element rather than repeating code in 
	//every win_.js file but i tried it a few ways and i never got it to work.
	function goHome(){
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
	homeButton.addEventListener('click',goHome);
	// Cleanup and return home
	win.addEventListener('android:back', goHome);
	
	return win;
	};
