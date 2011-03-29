// The main screen for plotting results
var win = Titanium.UI.currentWindow;
var winHome = win.home;

Ti.include('../js/datetimehelpers.js');
Ti.include('../data/sessions.js');
Ti.include('../data/selfAssessment.js');
Ti.include('../data/doseageLog.js');


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

value = 100;
value2 = 100;
value3 = 150;
var percent = 50;

var SessionID = Titanium.App.Properties.getInt('SessionID');

//All dose data for this session
var AllDrinks = doseageLog.getAllSessionData(SessionID);


// Attach an APP wide event listener
Ti.App.addEventListener('webToTi', function(e) {
	Ti.API.info('webToTi Sent:'+e.test);

});


// Create a timeout - we want time for the window to be ready before we fire the event
setTimeout(function(e){
	Ti.App.fireEvent("webPageReady", {
		"alldrinks": AllDrinks
	});
},10000);  // 10s should be enough :)


var webview = Ti.UI.createWebView({
	top:0,
	left:0,
	height:'auto',
	width:'auto',
	url:'../charts/chart3.html'
});
axisView.add(webview);


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

//
///////////////////////////////////////
//// Plot some data
//
//sessionData = sessions.getLatestData(0);
//drinkData = doseageLog.getAllSessionData(sessionData.ID);
//emotionData = selfAssesment.getAllSessionData(sessionData.ID);
//
//var sessionLength = sessionData.LastUpdate - sessionData.StartTime; 
//var totalDrunk = numUnits(drinkData);
//if (drinkData.length > 0 ){
//	var maxUnits = totalDrunk[drinkData.length-1];
//	
//	for (var step = 0;step<drinkData.length;step++){
//
//		var x =	axisInset+(widthAxis-axisInset)*(drinkData[step].DoseageChanged- sessionData.StartTime)/sessionLength;
//		var y = axisInset+(heightAxis-axisInset)*(totalDrunk[step])/maxUnits;
//		
//		var booze = Titanium.UI.createImageView({
//			image:'../icons/Misc.png',
//			height:sizeDataPoint,
//			width:sizeDataPoint,
//			bottom:y,
//			left:x
//		});
//		axisView.add(booze);
//	}
//}

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
