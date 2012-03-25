/**
 * @author Caspar Addyman
 * 
 * TThe graph plotting screen, which sends the data to a
 * webView which uses RGraph library to plot the results. 
 * 
 * Copyright yourbrainondrugs.net 2011
 */


	exports.populateGraphView = function(view){

		//add the appropriate requires	
		var dataObject = require('/db/dataObject');
		var dbSessions  = require('/db/sessions');
		var dbDoseageLog = require('/db/doseageLog');
		var dateTimeHelpers = require('/js/dateTimeHelpers');
		var dataOverTime = require('/analysis/dataOverTime');
		var dbSelfAssessment = require('/db/selfAssessment');
		var menu = require('/ui/menu') ;
		//include the menu choices	
		//need to give it specific help for this screen
		menu.setHelpMessage("Chart plots drinks, blood alcohol and happiness levels over various time periods. Swipe upwards to access controls.");
	
		var  sizeAxisIcon = 48, reloadData;
		
		var SessionID = Titanium.App.Properties.getInt('SessionID');
		var standardDrinks = dataObject.getStandardDrinks();
		
		var millsPerStandardUnits = standardDrinks[0].MillilitresPerUnit;
		
		//data variables
		var startTime, nTimeSteps, allDrinks, selfAssess;
		var timeAxis = Titanium.App.Properties.getString('GraphTimeAxis', 'Hourly Graph');
		Ti.API.debug('Charts - timeAxis ' + timeAxis);	
		
		function loadData(type){	
			//appdebugsteps +='loading chart data..';
			if (type === "Hourly Graph"){		
				//All dose data for this session
				var sessionData =dbSessions.getSession(SessionID);
				allDrinks = dbDoseageLog.getAllSessionData(SessionID);
				selfAssess = dbSelfAssessment.getAllSessionData(SessionID);
				startTime = sessionData[0].StartTime;
				nTimeSteps = 24;
			}else if (type === "Weekly Graph"){
				Ti.API.debug('Charts load week of data');
				var aWeekAgo = parseInt((new Date()).getTime()/1000,10) - 3600 * 24 * 7;
				allDrinks = dbDoseageLog.getTimeRangeData(aWeekAgo);
				selfAssess = dbSelfAssessment.getTimeRangeData(aWeekAgo);
				startTime = aWeekAgo;
				nTimeSteps = 84;
			}
			reloadData  = false;
			//appdebugsteps +='finished loading chart data..';
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
		//appdebugsteps +='adding webView..';
		view.add(webView);
		//appdebugsteps +='added webView..';
			
		// // Attach an APP wide event listener	
		// // it gets fired when the webView has finished loading
		// Ti.App.addEventListener('webViewLoaded', function(e) {
			// //appdebugsteps +='event: webViewLoaded';
			// //alert(appdebugsteps);
			// redrawGraph();
		// });
		//as an alternative to call back use this 
		webView.addEventListener('load', function(e) {
		    // code that fires AFTER webview has loaded
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
		view.add(time);	
		time.addEventListener('click', function(){
			//click on the time icon to toggle the time axis
			//and hence the type of graph we plot. 
			changeGraphTimeAxis();
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
				changeGraphTimeAxis();
				redrawGraph();
			});
			view.add(labelWeeklyDailyGraph);
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
		// try{
				
			//appdebugsteps +='redrawGraph start ..';
			if (reloadData){
				loadData(timeAxis);
				//appdebugsteps +='redrawGraph: data loaded';
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
			var timeSteps =	dateTimeHelpers.timeIntervals(nTimeSteps,startTime, now);
			var timeLabels = [];
		
			if (timeAxis === "Monthly Graph"){
				for (var t = 0;t< nTimeSteps;t++){
					//just show every 12th label
					if (t % 12 === 0){
						timeLabels[t] = dateTimeHelpers.formatDay(timeSteps[t]);			
					}
				}
				
			}else{
				var showMins = ((now - timeSteps[0]) < 12*3600); //show minutes if short session
				for (var t = 0;t< nTimeSteps;t++){
					//just show every 4th label
					if (t % 4 === 0){
						timeLabels[t] = dateTimeHelpers.formatTime(timeSteps[t],showMins,true);			
					}
				}
				
			}
			
		
			//Ti.API.debug('redrawGraph -allDrinks ' + JSON.stringify(allDrinks));
			var personalInfo = dataObject.getPersonalInfo();
			var drinkSteps = dataOverTime.drinksByTime(timeSteps,allDrinks,personalInfo, millsPerStandardUnits);
			Ti.API.debug('redrawGraph -selfAssess ' + JSON.stringify(selfAssess));
			var emotionSteps = dataOverTime.emotionsByTime(timeSteps,selfAssess);
			//var stroopSteps = gameByTime(timeSteps,gameData);
			
			var myData =  JSON.stringify({
				options: options,
				timeLabels:timeLabels,
				//sessData: sessionData,
				selfData: emotionSteps, 			
				drinkData:drinkSteps	});
			
			//appdebugsteps +='pre webView.evalJS';
			webView.evalJS("paintLineChart('" + myData + "')");
			//appdebugsteps +='post webView.evalJS';
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
		view.add(switchDrinks);
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
		view.add(switchBloodAlcohol);
		
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
		view.add(switchHappiness);
		
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
		view.add(switchEnergy);
		
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
		view.add(switchDrunk);
		
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
		view.add(labelMenu);
		
		
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
		view.addEventListener('touchstart', function (e) {
		    y_start = e.y;
		});
		view.addEventListener('touchend', function (e) {
		    if (e.y - y_start > 20) {
		        swipe({direction: 'down'});
		    } else if (e.y - y_start < -20)  {
		        swipe({direction: 'up'});
		    }
		});
		 
		
		
		var settingsButton = Ti.UI.createButton({
			title:'Change..',
			width:70,
			height:28,
			bottom:4,
			right:4,
			backgroundColor:'grey'
		});
		view.add(settingsButton);
		settingsButton.addEventListener('click',function(){
			//show the analysis settings screen.
			Titanium.App.Properties.setString('ChartType', 'Settings');
			var chartMenu = require('/win/win_chartMenu');
			chartMenu.switchChartView();
		});
	
	return view;
	};
