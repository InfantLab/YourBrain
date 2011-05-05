/**
 * @author Caspar Addyman
 * 
 * The original low tech screen for plotting results.
 * This is being superceded by version using RGraph.js library
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {

	// The main screen for plotting results
	var win = Titanium.UI.currentWindow;
	
	
	//size of axis object
	var topAxis = 10;
	var leftAxis = 30;
	var sizeDataPoint = 24;
	var sizeAxisIcon = 32;
	var widthAxis = 360;	
	var heightAxis = 216;
	var axisInset = 18;  //how far inset is the origin?
	
	
	var axisView = Ti.UI.createView({
		width:widthAxis,
		height:heightAxis,
		top:topAxis,
		left:leftAxis,
	});
	win.add(axisView);
	var blackAxisView = Ti.UI.createImageView({
		image:'../images/blackaxis800x480.png',
		left:0,
		top:0,
		height:heightAxis,
		width:widthAxis
	})
	axisView.add(blackAxisView);	
	
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
		left:widthAxis	
	})
	win.add(time);
	
	
	
	/////////////////////////////////////
	// Plot some data
	
	sessionData = 	Titanium.App.boozerlyzer.data.sessions.getLatestData(0);
	drinkData = 	Titanium.App.boozerlyzer.data.doseageLog.getAllSessionData(sessionData.ID);
	emotionData = 	Titanium.App.boozerlyzer.data.selfAssessment.getAllSessionData(sessionData.ID);
	
	var sessionLength = sessionData.LastUpdate - sessionData.StartTime; 
	var totalDrunk = numUnits(drinkData);
	if (drinkData.length > 0 ){
		var maxUnits = totalDrunk[drinkData.length-1];
		
		for (var step = 0;step<drinkData.length;step++){
	
			var x =	axisInset+(widthAxis-axisInset)*(drinkData[step].DoseageChanged- sessionData.StartTime)/sessionLength;
			var y = axisInset+(heightAxis-axisInset)*(totalDrunk[step])/maxUnits;
			
			var booze = Titanium.UI.createImageView({
				image:'../icons/Misc.png',
				height:sizeDataPoint,
				width:sizeDataPoint,
				bottom:y,
				left:x
			});
			axisView.add(booze);
		}
	
		Ti.API.debug('emotion length: ' + emotionData.length);
		for (step = 0;step<emotionData.length;step++){
	
			var x1 =	axisInset+(widthAxis-axisInset)*(emotionData[step].SelfAssessmentChanged - sessionData.StartTime)/sessionLength;
			var yh = axisInset+(heightAxis-axisInset)*(emotionData[step].Happiness)/100;
			var ye = axisInset+(heightAxis-axisInset)*(emotionData[step].Energy)/100;
			var yd = axisInset+(heightAxis-axisInset)*(emotionData[step].Drunkeness)/100;
			
			var imgh =- (emotionData[step].Happiness > 50 ? '../icons/Happy.png': '../icons/Sad.png');
			var imgd =- (emotionData[step].Drunkeness > 50 ? '../icons/Drunk.png': '../icons/Sober.png');
			var imge = '';
			if (emotionData[step].Energy > 66) {
				imge = '../icons/OnLamp.png';
			}else if (emotionData[step].Energy > 33){
				imge = '../icons/DullLamp.png';
			}else{
				imge = '../icons/OffLamp.png';
			}
			
			var booze = Titanium.UI.createImageView({
				image:img,
				height:sizeDataPoint,
				width:sizeDataPoint,
				bottom:y1,
				left:x1
			});
			axisView.add(booze);
		}
		
		
	}
	
	
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