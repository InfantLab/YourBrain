// The main screen for  results
var win = Titanium.UI.currentWindow;
var winHome = win.home;

Ti.include('../js/datetimehelpers.js');
Ti.include('../data/sessions.js');
Ti.include('../data/selfAssessment.js');
Ti.include('../data/doseageLog.js');


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

var labelCurrentSession = Titanium.UI.createLabel({
	text:'Session started\n Sat 3th, 12:00pm',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	left:56,
	height:32,
	width:120,
	bottom:1,
	color:'white',
	backgroundColor:'black',
	borderColor:'gray',
	borderRadius:4
});
labelCurrentSession.addEventListener('click', function(){
		newSessionDialog.show();
});

// Cleanup and return home
win.addEventListener('close', function(e) {
	selfAssessment.setData(currentEmotion);
	sessions.Updated(SessionID);
	var winHome = Titanium.UI.creatWindow({
		url:'../app.js',
		title:'Boozerlyzer',
		backgroundImage:'../images/smallcornercup.png'
	})
	winHome.open();
});

/////////////////////////////////////
// Plot some data

sessionData = sessions.getLatestData(0);
drinkData = doseageLog.getAllSessionData(sessionData.ID);
emotionData = selfAssessment.getAllSessionData(sessionData.ID);

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
	if (winHome === undefined || winHome === null) {
		winHome = Titanium.UI.createWindow({ modal:true,
			url: '../app.js',
			title: 'Boozerlyzer',
			backgroundImage: '../images/smallcornercup.png',
			orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
		})
	}
	win.close();
	winHome.open();
});