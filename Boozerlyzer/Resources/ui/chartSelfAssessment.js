/**
 * @author Caspar Addyman
 * 
 * The graph plotting screen, which sends the data to a
 * webView which uses RGraph library to plot the results. 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

	exports.populateGraphView = function(view){
	
		var gameData;
		var  sizeAxisIcon = 48;
	
		//add the appropriate requires	
		var dataObject = require('/db/dataObject');
		var gameScores = require('/db/gameScores');
		var menu = require('/ui/menu');
		//include the menu choices	
		//need to give it specific help for this screen
		menu.setHelpMessage("Chart plots mood scores against the number of drinks or level of blood alcohol. Swipe upwards to access controls.");


		function loadData(){	
			gameData = gameScores.GamePlaySummary(null, null, null, true);
		}
		
		var webView = Ti.UI.createWebView({
			bottom:60,
			left:0,
			height:'auto',
			width:'auto',
			url:'/charts/chartScatterSelfAssessment.html',
			zIndex:9
		});
		view.add(webView);			
		webView.addEventListener('load', function(e) {
		    // code that fires AFTER webview has loaded
		    redrawGraph();
		 });
		
		var xAxisIcon = Ti.UI.createImageView({
			image:'/icons/newdrinks.png',
			height:sizeAxisIcon,
			width:sizeAxisIcon,
			bottom:30,
			right:4,
			zIndex:10
		});
		view.add(xAxisIcon);	
		// xAxisIcon.addEventListener('click', function(){
			// //click on the time icon to toggle the time axis
			// //and hence the type of graph we plot. 
			// changeXAxisIcon();
			// redrawGraph();
		// });
		
		// var labelWeeklyDailyGraph, controlsDrawn = false; 
		
		// function drawGraphControls(){	
			// //appdebugsteps +='drawGraphControls ..';
			// if (controlsDrawn) { return;}
// 		
			// labelWeeklyDailyGraph = Ti.UI.createLabel({
				// title: 'Weekly Graph',
				// font:{fontSize:12,fontWeight:'bold'},
				// bottom : 90,
				// right: 10,
				// value:true,
				// color:'black'
			// });
			// labelWeeklyDailyGraph.addEventListener('change', function(){
				// changeXAxisIcon();
				// redrawGraph();
			// });
			// view.add(labelWeeklyDailyGraph);
			// controlsDrawn = true;
		// }
		// drawGraphControls();
		
		// /**
		 // * change from daily to hourly graph types.
		 // * if a type is passed in use that otherwise
		 // * toggle from current type to the other.
		 // */
		// function changeXAxisIcon(){
			// var	type = (labelWeeklyDailyGraph.text === "Weekly Graph" ? "Hourly Graph" :"Weekly Graph");
			// if (type === "Weekly Graph"){
				// xAxisIcon.image = '/icons/calendar.png';
			// }else {
				// xAxisIcon.image = '/icons/time.png';
			// }
			// labelWeeklyDailyGraph.text = type;
			// Titanium.App.Properties.setString('GraphScatterX', type);
			// xAxis = type;
			// reloadData  = true; //need to reload the data next time we plot graph
		// }
		// changeXAxisIcon();
		
		function redrawGraph(){
			loadData();
			var stdDrinks = dataObject.getStandardDrinks();
			var mills = stdDrinks[0].MillilitresPerUnit;
			Ti.API.debug('selfassessment stdDrinks mills ' + mills);
			//webView has loaded so we can draw our chart
			var options = {
				plotDrinks:switchDrinks.value,
				plotBloodAlcohol:switchBloodAlcohol.value,
				// plotHappiness:switchHappiness.value,
				// plotEnergy:switchEnergy.value,
				// plotDrunk:switchDrunk.value,
				//plotStroop:switchStroop.value,
				// colorTotal:switchHappiness.color,
				// colorSpeed:switchEnergy.color,
				// colorCoord:switchDrunk.color,
				// colorInhibit:switchDrunk.color,
				MillsPerStandardDrink:mills
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
		}
		
		
		//listen for errors from webView
		webView.addEventListener("error", function(e){
		    Ti.API.log("Error: " + e.message);
			//do something
			alert('Charting error ' + e.message);
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
		
	var switchDrinks = Ti.UI.createSwitch({
		style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
		title: 'Drinks',
		font:{fontSize:12,fontWeight:'bold'},
		bottom :20,
		left: 60,
		value:Ti.App.Properties.getBool('switchSelfAssessementXAxisDrinks',true),
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
		

	return view;
	};
