var win = Titanium.UI.currentWindow;
var winHome = win.home;

//layout variables
var topHeading = 5;
var topContent = 50;
var topChangedLabel = 200;

Ti.include('../data/tripReports.js','../js/datetimehelpers.js');

//current session ID
var SessionID = Titanium.App.Properties.getInt('SessionID');

//most recent emotion values for this session
var currentTripReport = tripReports.getLatestData(SessionID);
if (currentTripReport === null || currentTripReport === false){
	currentTripReport = tripReports.newReport();
}
Titanium.API.debug(JSON.stringify(currentTripReport));


var label = Titanium.UI.createLabel({
	text:'How are you?',
	left:10,
	top:topHeading,
	font:{fontSize:18,fontWeight:'bold'}
});
win.add(label);

var tripContent = Titanium.UI.createTextField({
	value:currentTripReport[0].Content,
	color:'#336699',
	hintText:'I feel...',
	textAlign:'left',
	height:140,
	top:topContent,
	left:10,
	right:10,
	borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	font:{fontSize:18,fontWeight:'bold'}
});
win.add(tripContent);
tripContent.addEventListener('change', function(){
	currentTripReport[0].Changed = true;
	currentTripReport[0].Nickname = tripContent.value;
});

var updated = prettyDate(currentTripReport[0].ReportChanged);
var lastchangedLabel = Ti.UI.createLabel({
	text:'Last Updated\n' + updated,
	top:topChangedLabel,
	left:10,
	width:'auto',
	textAlign:'center'
});
win.add(lastchangedLabel);

// SAVE BUTTON	
var save = Ti.UI.createButton({
	title:'Save',
	width:70,
	height:28,
	bottom:4,
	right:4,
	backgroundColor:'green'
});
win.add(save);

save.addEventListener('click',function()
{
	tripReports.setData(currentTripReport);
	win.close();
});	
// CANCEL BUTTON	
var cancel = Ti.UI.createButton({
	title:'Cancel',
	width:70,
	height:28,
	bottom:4,
	right:80,
	backgroundColor:'red'
});
win.add(cancel);

cancel.addEventListener('click',function()
{
	win.close();
});	

// ICONS TO GO TO OTHER SCREENS
//
//layout variables
//Button layout Vars
var bigIcons = 60;
var bottomButtons = 5;
var leftFirst = 60;
var leftSecond = 140;
var leftThird = 200;

// BACK TO NEW DRINKS
var newdrinks = Titanium.UI.createImageView({
	image:'../icons/newdrinks.png',
	height:bigIcons,
	width:bigIcons,
	bottom:bottomButtons,
	left:leftFirst
});
newdrinks.addEventListener('click',function(){
	var newdosewin = Titanium.UI.createWindow({ modal:true,
		url:'../screens/win_dosage.js',
		title:'What have you had to drink?',
		backgroundImage:'../images/smallcornercup.png'
	});
	newdosewin.home =  winHome;
	win.close();
	newdosewin.open();
});
win.add(newdrinks);

var newmood = Titanium.UI.createImageView({
	image:'../icons/TheaterYellow2.png',
	height:bigIcons,
	width:bigIcons,
	bottom:bottomButtons,
	left:leftSecond
});
newmood.addEventListener('click',function(){
	var newmoodwin = Titanium.UI.createWindow({ modal:true,
		modal:true,
		url:'../screens/win_emotion.js',
		title:'How are you feeling?',
		backgroundImage:'../images/smallcornercup.png'
	});
	win.close();
	newmoodwin.open();
});
win.add(newmood);

var newgame = Titanium.UI.createImageView({
	image:'../icons/hamsterwheel.png',
	height:bigIcons,
	width:bigIcons,
	bottom:bottomButtons,
	left:leftThird
});
newgame.addEventListener('click',function(){
	var winplay = Titanium.UI.createWindow({ modal:true,
		modal:true,
		url:'../screens/win_game1.js',
		title:'YBOB Game 1 - Level 1',
		backgroundImage:'../images/smallcornercup.png'
	});
	winplay.open();
	win.close();
});
win.add(newgame);

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