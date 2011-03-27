//the start screen for the YBOB boozerlyzer
var homeWin = Titanium.UI.createWindow({
	exitOnClose: true,
	orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT],  //Landscape mode
	title:'YBOB Boozerlyzer',
	backgroundImage:'../images/smallcornercup.png'});
Titanium.UI.title = "Boozerlyzer";

Ti.include('../js/datetimehelpers.js');
Ti.include('../data/sessions.js');

var loadedonce = false;

// layout variables
var bigIcons = 76;
var leftAppName = 20;
var	leftNewDrinks = leftAppName;
var leftEmotion = 100;
var leftGame = 180;
var topNewDrinks = 80;
var topEmotion = 140;
var topGame = 200;
var topResults = 120;
var leftResults = 300;
var optionsLeft = 320;


//
// Some properties for this application
//
var enteredData = Titanium.App.Properties.getBool('EnteredPersonalData',false);
if (!enteredData){
	var nagtime = Titanium.App.Properties.getInt('NagTime', 0);
	if (nagtime < 7) {
		Titanium.App.Properties.setInt('NagTime', nagtime + 1);
	}else {
		alert('Please click on the Safe to enter your personal details');
		Titanium.App.Properties.setInt('NagTime', 0);
	}
}

var label1 = Titanium.UI.createLabel({
	color:'#911',
	text:'Boozerlyzer',
	font:{fontSize:48,fontFamily:'Marker Felt',fontWeight:'bold'},
	textAlign:'center',
	width:'auto',
	top:2,
	left:leftAppName
});
homeWin.add(label1);

var labelVers = Titanium.UI.createLabel({
	color:'#999',
	text:'Version: '+ Titanium.App.getVersion(),
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	top:52,
	left:leftAppName
});
homeWin.add(labelVers);

var labelCredits = Titanium.UI.createLabel({
	autoLink : Ti.UI.Android.LINKIFY_ALL,
	color:'#000',
	text:'Created by  ' + Titanium.App.getURL() + '\nBuilt with  http://appcelerator.com',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	right:00,
	width:240,
	bottom:0
});
homeWin.add(labelCredits);

var personalinfo = Titanium.UI.createImageView({
	image:'../icons/safe.png',
	height:48,
	width:48,
	top:20,
	left:optionsLeft
});
personalinfo.addEventListener('click',function(){
	var winpers = Titanium.UI.createWindow({ 
		exitOnClose: false,
		modal:true,
		url:'../screens/win_mydata.js',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT],  //Landscape mode only
		title:'Personal and Privacy',
		backgroundImage:'../images/smallcornercup.png'
	});
	winpers.home = homeWin; //reference to home
	winpers.open();
});
homeWin.add(personalinfo);
var matemode = Titanium.UI.createImageView({
	image:'../icons/Chorus.png',
	height:48,
	width:48,
	top:20,
	left:optionsLeft + 52
});
matemode.addEventListener('click',function(){
	var winreport = Titanium.UI.createWindow({ modal:true,
		url:'../screens/win_results1.js',
		title:'Personal Information',
		backgroundImage:'../images/smallcornercup.png',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	});
	winreport.home = homeWin; //reference to home
	winreport.open();
});
homeWin.add(matemode);


var debug = Titanium.UI.createImageView({
	image:'../icons/Misc.png',
	height:48,
	width:48,
	top:60,
	right:10
});


debug.addEventListener('click',function(){
	var gametypes = ['Pissonyms', 'Emotion', 'WeFeelFine'];
	var pick = Math.round(3*Math.random());
	var winpissonym = Titanium.UI.createWindow({ modal:true,
		url:'../screens/win_game2.js',
		title:'Pissonyms',
		backgroundImage:'../images/smallcornercup.png',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
		});
	winpissonym.home = homeWin; //reference to home
	winpissonym.gameType = gametypes[pick];
	winpissonym.numRounds = 3;
	winpissonym.open();
});

homeWin.add(debug);

var report = Titanium.UI.createImageView({
	image:'../icons/ybob-logo2-sml.png',
	height:160,
	width:140,
	top:topResults,
	left:leftResults
});

report.addEventListener('click',function(){
	var winreport = Titanium.UI.createWindow({ modal:true,
		url:'../screens/win_results1.js',
		title:'Personal Information',
		backgroundImage:'../images/smallcornercup.png',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
		});
	winreport.home = homeWin; //reference to home
	winreport.open();
});
homeWin.add(report);


var newdrinks = Titanium.UI.createImageView({
	image:'../icons/newdrinks.png',
	height:bigIcons,
	width:bigIcons,
	top:topNewDrinks,
	left:leftNewDrinks
});
newdrinks.addEventListener('click',function(){
	var newdosewin = Titanium.UI.createWindow({ modal:true,
		url:'../screens/win_dosage.js',
		title:'What have you had to drink?',
		backgroundImage:'../images/smallcornercup.png',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
		});
	newdosewin.home = homeWin; //reference to home
	newdosewin.open();
});
homeWin.add(newdrinks);

var newmood = Titanium.UI.createImageView({
	image:'../icons/TheaterYellow2.png',
	height:bigIcons,
	width:bigIcons,
	top:topEmotion,
	left:leftEmotion
});
newmood.addEventListener('click',function(){
	var newmoodwin = Titanium.UI.createWindow({ 
	modal:true,
		url:'../screens/win_emotion.js',
		title:'How are you feeling?',
		backgroundImage:'../images/smallcornercup.png',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
		});
	newmoodwin.home = homeWin; //reference to home
	newmoodwin.open();
});
homeWin.add(newmood);

var newtripreport = Titanium.UI.createImageView({
	image:'../icons/tripreport.png',
	height:bigIcons * .8,
	width:bigIcons * .8,
	top:topNewDrinks,
	left:leftGame
});
newtripreport.addEventListener('click',function(){
	var newtripwin = Titanium.UI.createWindow({ modal:true,
		url:'../screens/win_tripreport.js',
		title:'How are you feeling?',
		backgroundImage:'../images/smallcornercup.png',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
		});
	newtripwin.home = homeWin; //reference to home
	newtripwin.open();
});
homeWin.add(newtripreport);

var newgame = Titanium.UI.createImageView({
	image:'../icons/hamsterwheel.png',
	height:bigIcons,
	width:bigIcons,
	top:topGame,
	left:leftGame
});
newgame.addEventListener('click',function(){
	var winplay = Titanium.UI.createWindow({ modal:true,
		url:'../screens/win_game1.js',
		title:'YBOB Game 1 - Level 1',
		backgroundImage:'../images/smallcornercup.png',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
		});
	winplay.home = homeWin; //reference to home
	winplay.open();
});
homeWin.add(newgame);

var labelCurrentSession = Titanium.UI.createLabel({
	text:'Session started\n Sat 3th, 12:00pm',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	left:leftNewDrinks + 36,
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
var labelLastUpdate = Titanium.UI.createLabel({
	color:'#000',
	text:'',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	left:leftNewDrinks + 36,
	height:32,
	width:120,
	bottom:33
});
homeWin.add(labelCurrentSession);
homeWin.add(labelLastUpdate);

//what is the current session? 
//if last update was >36 hours ago automatically start new session
//if last update was >12 hours ago ask if what to start new session
//if last update was <12 hours ago continue that session[0].
var newSessionDialog = Titanium.UI.createOptionDialog({
	options:['New session', 'Continue..'],
	destructive:2,
	cancel:1,
	title:'Start a new session?'
});
// add event listener
newSessionDialog.addEventListener('click',function(e)
{
	if (e.index === 0) {
		session = sessions.createNewSession(false);
		rewriteUpdateLabel();
		labelCurrentSession.text = 'Session Started\n' + formatDayPlusTime(session[0].StartTime,true);
	}
});


var session = sessions.getLatestData(0);
if (session === null || session === false){
	session = sessions.createNewSession(false);
}
function rewriteUpdateLabel(){
	var timeSinceUpdate = prettyDate(session[0].LastUpdate);
	labelLastUpdate.text = 'Last activity\n' + timeSinceUpdate;

}
rewriteUpdateLabel();
Titanium.API.debug("session info: " + JSON.stringify(session));
Titanium.API.debug("session lastupdate: " + session[0].LastUpdate);
var now = parseInt((new Date()).getTime()/1000);
if (now - session[0].LastUpdate  <43200){ //12hours
}else if (now - session[0].LastUpdate < 129600){ //36 hours
	newSessionDialog.show();
}else{
	//>36 hours since last update, don't ask just start new
	session = sessions.createNewSession(false);
} 
rewriteUpdateLabel();
labelCurrentSession.text = 'Session Started\n' + formatDayPlusTime(session[0].StartTime,true);
Ti.API.debug('Session ID - ' + session[0].ID);
Titanium.App.Properties.setInt('SessionID', session[0].ID);
Titanium.App.Properties.setInt('SessionStart',session[0].StartTime/1000);
Titanium.App.Properties.setInt('SessionChanged',session[0].LastUpdate/1000);

var mateModeSwitch = Ti.UI.createSwitch({
	style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
	title: 'Mate Mode',
	top : 4,
	right: 4
});
homeWin.add(mateModeSwitch);
homeWin.open();
loadedonce = true;

homeWin.addEventListener('focus', function(){
	if (loadedonce){
		//this code only runs when we reload this page
	    rewriteUpdateLabel();		
	}
});
