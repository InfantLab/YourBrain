/**
 * @author Caspar Addyman
 * 
 * TThe graph plotting screen, which sends the data to a
 * webView which uses RGraph library to plot the results. 
 * 
 * Copyright yourbrainondrugs.net 2011
 */
var win, viewCollection = [];

exports.createApplicationWindow = function(){
	win = Titanium.UI.createWindow({
		title:'YBOB Boozerlyzer',
		backgroundImage:'/images/smallcornercup.png',
		modal:true
		});	
	win.orientationModes =  [Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];	
	var winHome;

	//add the appropriate requires	
	var menu = require('/ui/menu') ;
	//include the menu choices	
	//need to give it specific help for this screen
	menu.setHelpMessage("Chart plots drinks, blood alcohol and happiness levels over various time periods. Swipe upwards to access controls.");
	win.activity.onCreateOptionsMenu = function(event){
		menu.createMenus(event);
	};

		

	//decide what type of chart we are showing and
	//populate the view accordingly.
	exports.switchChartView();
	
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

var viewGraphContainer ;
exports.switchChartView = function(){
	
	if (viewGraphContainer){
		//remove old version
		//first remove its children
		while (viewGraphContainer.children.length){
			viewGraphContainer.remove(viewGraphContainer.children[0]);
		}
		//then remove view itself
		win.remove(viewGraphContainer);
		viewGraphContainer = null;
	}
	// var viewFound = false;
	var visibleChart = Titanium.App.Properties.getString('ChartType','Settings');
	// for (var viewName in viewCollection){
		// if (viewName === visibleChart){
			// //make this view visible
			// viewFound = true;
			// Ti.API.debug('viewFound ' + viewName);
			// viewCollection[viewName].visible = true;
		// }else{
			// //and all others invisible
			// viewCollection[viewName].visible = false;
		// }
	// }
	// if (!viewFound){
		var chart;
		//need to add new view
		switch  (visibleChart){
			case 'Time':
			  chart = require('/ui/chartTime');
			  break;
			case 'Scatter':
			  chart = require('/ui/chartScatter');
			  break;
			case 'SelfAssessment':
			  chart = require('/ui/chartSelfAssessment');
			  break;
			case 'Settings':
			  chart = require('/ui/chartSettings');
			  break;
			default:
			  chart = require('/ui/chartSettings');
		}
		viewGraphContainer = Ti.UI.createView({
			bottom:0,
			left:0,
			height:'auto',
			width:'auto'
		});
		Ti.API.debug('view created ' + visibleChart);
		win.add(viewGraphContainer);
		// viewCollection[visibleChart] = viewGraphContainer;
		chart.populateGraphView(viewGraphContainer);	
	// }	


			
};		

