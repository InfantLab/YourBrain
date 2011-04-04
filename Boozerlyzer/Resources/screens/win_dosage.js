var win = Titanium.UI.currentWindow;
var winHome = win.home;
var winOpened = parseInt((new Date()).getTime()/1000);
var loadedonce = false;

Ti.include('../js/datetimehelpers.js');
Ti.include('../js/bloodalcohol.js');
Ti.include('../data/doseageLog.js');
Ti.include('../data/sessions.js');
Ti.include('../data/personalInfo.js','../js/datetimehelpers.js');

var persInfo = personalInfo.getData();

// the Dosesage database object
//current session ID
var SessionID = Titanium.App.Properties.getInt('SessionID');

//All dose data for this session
var AllDrinks = doseageLog.getAllSessionData(SessionID);
if (AllDrinks === null || AllDrinks === false){
	AllDrinks = doseageLog.newDoseage();
	sessions.Updated(SessionID);
}
Titanium.API.debug(JSON.stringify(AllDrinks));
var sessionData = sessions.getSession(SessionID);
Titanium.API.debug('sessionData -' + JSON.stringify(sessionData));
//find the last row 
var lastIndex = AllDrinks.length - 1;
//we will use these to keep count of drinks..
AllDrinks[lastIndex].DoseageStart = winOpened;
//AllDrinks[lastIndex].HalfPints
//AllDrinks[lastIndex].SmallWine
//AllDrinks[lastIndex].SingleSpirits

//layout variables
//glass icons and drink counters  
var leftEmpty = 20;
var leftFull = 200;
var leftDrinkType = 110;
var bigIcons = 60;
var halfOffset = bigIcons-15;
var smlIcon = 40;

var topBeer = 10;
var topWine = 85;
var topSpirit =150; 
var topTotal= 200;

//session log 
var leftSession = 300;
var topSession = 0;

var sessionView = Ti.UI.createView({
	borderColor:'#888',
	borderWidth:3,
	borderRadius:4,
	backgroundColor:'black',
	width:'auto',
	height:'auto',
	top:topSession,
	left:leftSession,
});
win.add(sessionView);

var beeradd = Titanium.UI.createImageView({
	image:'../icons/beer-full.png',
	height:bigIcons,
	width:bigIcons,
	top:topBeer,
	left:leftFull+halfOffset
});
win.add(beeradd);
beeradd.addEventListener('click',function (){
	AllDrinks[lastIndex].HalfPints += 2;
	totalizeDrinks();
});

var beerremove = Titanium.UI.createImageView({
	image:'../icons/beer-empty.png',
	height:bigIcons,
	width:bigIcons,
	top:topBeer,
	left:leftEmpty+halfOffset
});
win.add(beerremove);
beerremove.addEventListener('click',function (){
	if (AllDrinks[lastIndex].HalfPints> 1) {
		AllDrinks[lastIndex].HalfPints += -2;
		totalizeDrinks();
	}else if (AllDrinks[lastIndex].HalfPints> 0){
		AllDrinks[lastIndex].HalfPints += -1;
		totalizeDrinks();
	}
});

var beeradd_sml = Titanium.UI.createImageView({
	image:'../icons/beer-full.png',
	height:smlIcon,
	width:smlIcon,
	top:topBeer+bigIcons-smlIcon,
	left:leftFull
});
win.add(beeradd_sml);
beeradd_sml.addEventListener('click',function (){
	AllDrinks[lastIndex].HalfPints += 1;
	totalizeDrinks();
});

var beerremove_sml = Titanium.UI.createImageView({
	image:'../icons/beer-empty.png',
	height:smlIcon,
	width:smlIcon,
	top:topBeer+bigIcons-smlIcon,
	left:leftEmpty
});
win.add(beerremove_sml);
beerremove_sml.addEventListener('click',function (){
	if (AllDrinks[lastIndex].HalfPints> 0) {
		AllDrinks[lastIndex].HalfPints += -1;
		totalizeDrinks();
	}
});

var beercount = Ti.UI.createLabel({
	text:'0 pints',
	top:topBeer,
	left:leftDrinkType,
	width:100,
	height:bigIcons,
	textAlign:'center',
	color:'white'
});
win.add(beercount);


var wineadd = Titanium.UI.createImageView({
	image:'../icons/wine.png',
	height:bigIcons,
	width:bigIcons,
	top:topWine,
	left:leftFull+halfOffset
});
win.add(wineadd);
wineadd.addEventListener('click',function (){
	AllDrinks[lastIndex].SmallWine += 2;
	totalizeDrinks();
});

var wineremove = Titanium.UI.createImageView({
	image:'../icons/wine-empty.png',
	height:bigIcons,
	width:bigIcons,
	top:topWine,
	left:leftEmpty+halfOffset
});
win.add(wineremove);
wineremove.addEventListener('click',function (){
	if (AllDrinks[lastIndex].SmallWine > 1) {
		AllDrinks[lastIndex].SmallWine += -2;
		totalizeDrinks();
	}else if (AllDrinks[lastIndex].SmallWine > 0) {
		AllDrinks[lastIndex].SmallWine += -1;
		totalizeDrinks();
	}
});

var wineadd_sml = Titanium.UI.createImageView({
	image:'../icons/wine.png',
	height:smlIcon,
	width:smlIcon,
	top:topWine+bigIcons-smlIcon,
	left:leftFull
});
win.add(wineadd_sml);
wineadd_sml.addEventListener('click',function (){
	AllDrinks[lastIndex].SmallWine += 1;
	totalizeDrinks();
});

var wineremove_sml = Titanium.UI.createImageView({
	image:'../icons/wine-empty.png',
	height:smlIcon,
	width:smlIcon,
	top:topWine+bigIcons-smlIcon,
	left:leftEmpty
});
win.add(wineremove_sml);
wineremove_sml.addEventListener('click',function (){
	if (AllDrinks[lastIndex].SmallWine > 0) {
		AllDrinks[lastIndex].SmallWine += -1;
		totalizeDrinks();
	}
});

var winecount = Ti.UI.createLabel({
	text:'0 wines',
	top:topWine,
	left:leftDrinkType,
	width:100,
	height:bigIcons,
	textAlign:'center',
	color:'white'
});
win.add(winecount);

var spiritadd = Titanium.UI.createImageView({
	image:'../icons/whiskey.png',
	height:bigIcons * 0.9,
	width:bigIcons * 0.9,
	top:topSpirit+10,
	left:leftFull+halfOffset
});
win.add(spiritadd);
spiritadd.addEventListener('click',function (){
	AllDrinks[lastIndex].SingleSpirits += 2;
	totalizeDrinks();
});

var spiritremove = Titanium.UI.createImageView({
	image:'../icons/whiskey-empty.png',
	height:bigIcons * 0.9,
	width:bigIcons * 0.9,
	top:topSpirit+10,
	left:leftEmpty+halfOffset
});
win.add(spiritremove);
spiritremove.addEventListener('click',function (){
	if (AllDrinks[lastIndex].SingleSpirits>1){
		AllDrinks[lastIndex].SingleSpirits += -2;
		totalizeDrinks();	
	}else 	if (AllDrinks[lastIndex].SingleSpirits>0){
		AllDrinks[lastIndex].SingleSpirits += -1;
		totalizeDrinks();	
	}
});

var spiritadd_sml = Titanium.UI.createImageView({
	image:'../icons/whiskey.png',
	height:smlIcon * 0.9,
	width:smlIcon * 0.9,
	top:topSpirit+bigIcons-smlIcon,
	left:leftFull
});
win.add(spiritadd_sml);
spiritadd_sml.addEventListener('click',function (){
	AllDrinks[lastIndex].SingleSpirits += 1;
	totalizeDrinks();
});

var spiritremove_sml = Titanium.UI.createImageView({
	image:'../icons/whiskey-empty.png',
	height:smlIcon * 0.9,
	width:smlIcon * 0.9,
	top:topSpirit+bigIcons-smlIcon,
	left:leftEmpty
});
win.add(spiritremove_sml);
spiritremove_sml.addEventListener('click',function (){
	if (AllDrinks[lastIndex].SingleSpirits>0){
		AllDrinks[lastIndex].SingleSpirits += -1;
		totalizeDrinks();	
	}
});

var spiritcount = Ti.UI.createLabel({
	text:'0 spirits',
	top:topSpirit,
	left:leftDrinkType,
	width:100,
	height:bigIcons,
	textAlign:'center',
	color:'white'
});
win.add(spiritcount);


var UnitCount = Ti.UI.createLabel({
	text:'Total 0 units',
	top:topTotal,
	left:leftDrinkType - 40,
	width:180,
	height:'auto',
	textAlign:'center',
	color:'white'
});
win.add(UnitCount);
var BloodAlcohol = Ti.UI.createLabel({
	text:'Blood Alcohol',
	top:topTotal+22,
	left:leftDrinkType - 40,
	width:180,
	height:'auto',
	textAlign:'center',
	color:'white'
});
win.add(BloodAlcohol);

function formatTableRow(DrinkData){
	var currentTime = formatTime(DrinkData.DoseageChanged,true);
	var numPints = DrinkData.HalfPints/2;
	var numUnits = DrinkData.HalfPints+ DrinkData.SmallWine + DrinkData.SingleSpirits; 
	var runningTotal = numPints + ' p, ' + DrinkData.SmallWine + ' w,' + DrinkData.SingleSpirits + ' s  (' + numUnits + 'u)' ;
	return {className:'oneDrinkRow', title:currentTime + ' - ' + runningTotal};
}

function showDrinksCount(){
	var numPints = AllDrinks[lastIndex].HalfPints/2;
	var numUnits = AllDrinks[lastIndex].HalfPints+ AllDrinks[lastIndex].SmallWine + AllDrinks[lastIndex].SingleSpirits; 
	beercount.text = numPints + ' Pints';
	winecount.text = AllDrinks[lastIndex].SmallWine + ' Wine';
	spiritcount.text = AllDrinks[lastIndex].SingleSpirits + ' Spirits';
	UnitCount.text = 'Total ' + numUnits + ' units';
	calcDisplayBloodAlcohol();
}
function totalizeDrinks(){
	showDrinksCount();
	var now = parseInt((new Date()).getTime()/1000);
	AllDrinks[lastIndex].DoseageStart = winOpened;
	AllDrinks[lastIndex].DoseageChanged = now;
	AllDrinks[lastIndex].Changed = true;
	doseageLog.setData(AllDrinks[lastIndex]);
	sessions.Updated(SessionID);
	tv.appendRow(Ti.UI.createTableViewRow(formatTableRow(AllDrinks[lastIndex])));

}

function calcDisplayBloodAlcohol(){
	var BAC = BACalculate(sessionData, AllDrinks.slice(lastIndex),persInfo, true);
	BloodAlcohol.text = 'Blood Alcohol ' + Math.round((BAC[BAC.length -1]-0)*10000)/10000 + '%';	
}

// create table view data object
var data = [];

for(var idx=0;idx<AllDrinks.length; idx++){
	data.push(formatTableRow(AllDrinks[idx]));	
}



//var footer = Ti.UI.createView({
//	backgroundColor:'#111',
//	height:'auto'
//});
//
//var footerLabel = Ti.UI.createLabel({
//	font:{fontFamily:'Helvetica Neue',fontSize:12,fontWeight:'bold'},
//	text:'New session..',
//	color:'#191',
//	textAlign:'left',
//	left:4,
//	width:'auto',
//	height:'auto'
//});
//
//footer.add(footerLabel);

var header = Ti.UI.createView({
	backgroundColor:'#999',
	height:'auto'
});
var headerLabel = Ti.UI.createLabel({
	font:{fontFamily:'Helvetica Neue',fontSize:12,fontWeight:'bold'},
	text:'',
	color:'#222',
	textAlign:'center',
	top:0,
	left:4,
	width:'auto',
	height:30
});
header.add(headerLabel);


var tv = Ti.UI.createTableView({
	data:data, 
	headerView:header,
//	footerView:footer,
	rowHeight:12
});

sessionView.add(tv);

function setSessionLabel(){
	headerLabel.text = 'Session began: ' + formatDayPlusTime(sessionData[0].StartTime,true);
}

setSessionLabel();
showDrinksCount();

//buttons to navigate to other screens

//Button layout Vars
var bottomButtons = 5;
var leftFirst = 60;
var leftSecond = 140;
var leftThird = 200;

var newmood = Titanium.UI.createImageView({
	image:'../icons/TheaterYellow2.png',
	height:bigIcons,
	width:bigIcons,
	bottom:bottomButtons,
	left:leftFirst
});
newmood.addEventListener('click',function(){
	var newmoodwin = Titanium.UI.createWindow({ modal:true,
		url:'../screens/win_emotion.js',
		title:'How are you feeling?',
		backgroundImage:'../images/smallcornercup.png',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	});
	win.close();
	newmoodwin.home = winHome;
	newmoodwin.open();
});
win.add(newmood);

var newtripreport = Titanium.UI.createImageView({
	image:'../icons/tripreport.png',
	height:bigIcons * .8,
	width:bigIcons * .8,
	bottom:bottomButtons,
	left:leftSecond
});
newtripreport.addEventListener('click',function(){
	var newtripwin = Titanium.UI.createWindow({ modal:true,
		url:'../screens/win_tripreport.js',
		title:'How are you feeling?',
		backgroundImage:'../images/smallcornercup.png',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	});
	newtripwin.home = winHome;
	win.close();
	newtripwin.open();
});
win.add(newtripreport);

var newgame = Titanium.UI.createImageView({
	image:'../icons/hamsterwheel.png',
	height:bigIcons,
	width:bigIcons,	
	bottom:bottomButtons,
	left:leftThird
});
newgame.addEventListener('click',function(){
	var winplay = Titanium.UI.createWindow({ modal:true,
		url:'screens/win_gameMenu.js',
		title:'YBOB Game ',
		backgroundImage:'../images/smallcornercup.png',
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	});
	winplay.home = winHome;
	win.close();
	winplay.open();
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


loadedonce = true;

win.addEventListener('focus', function(){
	if (loadedonce){
		//this code only runs when we reload this page
		calcDisplayBloodAlcohol();
	}
});