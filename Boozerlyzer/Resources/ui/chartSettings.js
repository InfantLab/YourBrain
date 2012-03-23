/**
 * @author Caspar Addyman
 * 
 * TThe graph plotting screen, which sends the data to a
 * webView which uses RGraph library to plot the results. 
 * 
 * Copyright yourbrainondrugs.net 2011
 */
//add the appropriate requires	

exports.populateGraphView = function(view){
	var sizeButton = 140;
	
	var viewScatter = Ti.UI.createView({
		top: 40,
		left: 10,
		height: sizeButton,
		width: sizeButton
	});
	populateGraphButton(viewScatter, 'Scatter', '/icons/newdrinks.png', '/icons/hamsterwheel.png');
	var labelScatter = Ti.UI.createLabel({
		color:'black',
		font:{fontSize:16,fontFamily:'Helvetica Neue'},
		top:40+sizeButton,
		left:10,
		textAlign:'center',
		text:'Psychometric\nscatter plots'
	});
	view.add(labelScatter);
	view.add(viewScatter);
	var viewSelfAssessment = Ti.UI.createView({
		top: 40,
		left: 160,
		height: sizeButton,
		width: sizeButton
	});
	populateGraphButton(viewSelfAssessment, 'SelfAssessment', '/icons/newdrinks.png', '/icons/Happy.png');
	var labelSelfAssessment = Ti.UI.createLabel({
		color:'black',
		font:{fontSize:16,fontFamily:'Helvetica Neue'},
		top:40+sizeButton,
		left:160,
		textAlign:'center',
		text:'Mood-a-lyzer'
	});
	view.add(labelSelfAssessment);
	view.add(viewSelfAssessment);
	var viewTime = Ti.UI.createView({
		top: 40,
		left: 310,
		height: sizeButton,
		width: sizeButton
	});
	populateGraphButton(viewTime, 'Time', '/icons/time.png', '/icons/newdrinks.png');
	var labelSelfAssessment = Ti.UI.createLabel({
		color:'black',
		font:{fontSize:16,fontFamily:'Helvetica Neue'},
		top:40+sizeButton,
		left:310,
		textAlign:'center',
		text:'Data over Time'
	});
	view.add(labelSelfAssessment);
	view.add(viewTime);	

	var labelMenu = Ti.UI.createLabel({
		color:'black',
		font:{fontSize:20,fontFamily:'Helvetica Neue'},
		top:01,
		left:20,
		textAlign:'left',
		text:'Select the chart type..',
		height:'auto',
		width:'auto'
	});
	view.add(labelMenu);


};

	populateGraphButton = function(view,chartType, xIcon, yIcon){
		var sizeAxisIcon = 48;
		var x = Ti.UI.createImageView({
			image:xIcon,
			top:60,
			left:90,
			height:sizeAxisIcon,
			width:sizeAxisIcon
		});
		var y = Ti.UI.createImageView({
			image:yIcon,
			top:05,
			left:32,
			height:sizeAxisIcon,
			width:sizeAxisIcon
		})
		var axes = Ti.UI.createImageView({
			image:'/images/axes.bold.thin.png',
			top:0,
			left:0,
			height:'auto',
			width:'auto',
			opacity:0.5
		});

		view.add(x);
		view.add(y);
		view.add(axes);
		
		view.addEventListener('click', function(){
		// click button to show appropariate view
		 	Titanium.App.Properties.setString('ChartType', chartType);
			var chartMenu = require('/win/win_chartMenu');
			chartMenu.switchChartView();
		});
	};

	