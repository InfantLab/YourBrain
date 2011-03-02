//the start screen for the YBOB boozerlyzer
var win = Titanium.UI.createWindow({
	orientation:Titanium.UI.LANDSCAPE_LEFT,  //Landscape mode
	title:'YBOB Boozerlyzer',
	backgroundImage:'../images/mainmenu.png'});
Titanium.UI.title = "Boozerlyzer";


// layout variables
var choicesTop = 80;
var optionsLeft = 320;

//
// keep a note of the app details.
//
var appdata = '';
appdata+= 'ID: ' + Titanium.App.getID() + '\n';
appdata+= 'Name: ' + Titanium.App.getName() + '\n';
appdata+= 'Version: ' + Titanium.App.getVersion() + '\n';
appdata+= 'Publisher: ' + Titanium.App.getPublisher() + '\n';
appdata+= 'URL: ' + Titanium.App.getURL() + '\n';
appdata+= 'Description: ' + Titanium.App.getDescription() + '\n';
appdata+= 'Copyright: ' + Titanium.App.getCopyright() + '\n';
appdata+= 'GUID: ' + Titanium.App.getGUID() + '\n';
appdata+= 'Path: ' + Titanium.App.appURLToPath('index.html') + '\n';
appdata+= 'Arguments: ' + JSON.stringify(Titanium.App.getArguments()) + '\n';
appdata+= 'Build: ' + Titanium.version + '.' + Titanium.buildHash + ' (' + Titanium.buildDate + ')\n';

var label1 = Titanium.UI.createLabel({
	color:'#554',
	text:'Your Brain on Booze by yourbrainondrugs.net',
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto',
	top:win.height - 15,
	left:50
});
win.add(label1);

var labelVers = Titanium.UI.createLabel({
	color:'#554',
	text:'Vers: '+ Titanium.App.getVersion(),
	font:{fontSize:12,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto',
	top:win.height - 15,
	left:win.width - 60
});
win.add(labelVers);

var personalinfo = Titanium.UI.createImageView({
	image:'../icons/safe.png',
	height:48,
	width:48,
	top:20,
	left:optionsLeft
});
personalinfo.addEventListener('click',function(){
	var winpers = Titanium.UI.createWindow({
		url:'../screens/win_privacy.js',
		title:'Personal and Privacy',
		backgroundImage:'../images/mainmenu.png',
		modal:true
	});
	winpers.open();
});
win.add(personalinfo);
var matemode = Titanium.UI.createImageView({
	image:'../icons/Chorus.png',
	height:48,
	width:48,
	top:20,
	left:optionsLeft + 52
});
matemode.addEventListener('click',function(){
	var winreport = Titanium.UI.createWindow({
		url:'../screens/win_results1.js',
		title:'Personal Information',
		backgroundImage:'../images/mainmenu.png',
		modal:true
	});
	winreport.open();
});
win.add(matemode);


var report = Titanium.UI.createImageView({
	image:'../icons/ybob-logo2-sml.png',
	height:120,
	width:110,
	top:100,
	left:optionsLeft
});

report.addEventListener('click',function(){
	var winreport = Titanium.UI.createWindow({
		url:'../screens/win_results1.js',
		title:'Personal Information',
		backgroundImage:'../images/mainmenu.png',
		modal:true
	});
	winreport.open();
});
win.add(report);


var newdrinks = Titanium.UI.createImageView({
	image:'../icons/newdrinks.png',
	height:80,
	width:80,
	top:choicesTop,
	left:20
});
newdrinks.addEventListener('click',function(){
	var newdosewin = Titanium.UI.createWindow({
		url:'../screens/win_dosage.js',
		title:'What have you had to drink?',
		backgroundImage:'../images/mainmenu.png',
		modal:true
	});
	newdosewin.open();
});
win.add(newdrinks);

var newmood = Titanium.UI.createImageView({
	image:'../icons/TheaterYellow2.png',
	height:80,
	width:80,
	top:choicesTop,
	left:160
});
newmood.addEventListener('click',function(){
	var newmoodwin = Titanium.UI.createWindow({
		url:'../screens/win_emotion.js',
		title:'How are you feeling?',
		backgroundImage:'../images/mainmenu.png',
		modal:true
	});
	newmoodwin.open();
});
win.add(newmood);

var newgame = Titanium.UI.createImageView({
	image:'../icons/hamsterwheel.png',
	height:80,
	width:80,
	top:choicesTop+100,
	left:100
});
newgame.addEventListener('click',function(){
	var winplay = Titanium.UI.createWindow({
		url:'../screens/win_game1.js',
		title:'YBOB Game 1 - Level 1',
		backgroundImage:'../images/mainmenu.png',
		modal:true
	});
	winplay.open();
});
win.add(newgame);



win.open();
