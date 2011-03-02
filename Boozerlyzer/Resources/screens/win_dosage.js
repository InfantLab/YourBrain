var win = Titanium.UI.currentWindow;

//Ti.include('../js/datetimehelpers.js');

//layout variables  
var lftEmpty = 20;
var lftFull = 220;
var lftDrinkType = 110;
var bigIcon = 60;
var halfOffset = bigIcon-10;
var smlIcon = 40;

var beerTop = 20;
var wineTop = 100;
var spiritTop =180; 
var totalTop = 240;

var sessionStart = null;
var numPints = null;
var numWine = null;
var numSpirits = null;

var value = new Date();
value.setMinutes(10);
value.setHours(13);
value.setSeconds(48);

var sessionTimeLabel = Ti.UI.createLabel({
	text:'22:00',
	top:46,
	left:240,
	height:24,
	font:{fontFamily:'Helvetica Neue',fontSize:18,fontWeight:'bold'},
	textAlign:'left',
	color:'#191'
});
var session24hLabel = Ti.UI.createLabel({
	text:'PM',
	top:60,
	left:300,
	height:10,
	font:{fontFamily:'Helvetica Neue',fontSize:9,fontWeight:'bold'},
	textAlign:'left',
	color:'#191'
});
win.add(sessionTimeLabel);
win.add(session24hLabel);
sessionTimeLabel.addEventListener('doubleclick',function (){
	// reset the session start time 
	// 
	var dialog = Titanium.UI.createOptionDialog({
		options:['New Session', 'Carry on', 'Cancel'],
		destructive:2,
		cancel:1,
		title:'Do you want to start a new session?'
	});
	
	// add event listener
	dialog.addEventListener('click',function(e)
	{
		Ti.API.info('You selected ' + e.index);		
		if (e.index === 1){
			sessionTimeLabel.text = '23:58';
		}
		
		if (isAndroid) {
			if (e.button) {
				Ti.API.info('something about a button');
			}  else {
				Ti.API.info('something about an option');
			}
		}
	});
});
sessionTimeLabel.addEventListener('click',function (){
	//TODO we should show a modal view to pick a new time.
	
});


if (numPints === null){numPints = 0;};
if (numWine === null){numWine = 0;};
if (numSpirits === null){numSpirits = 3;};
 

var label = Ti.UI.createLabel({
	text:'This session started at',
	top:6,
	left:300,
	width:100,
	height:40,
	textAlign:'center',
	color:'white'
});
win.add(label);



var beeradd = Titanium.UI.createImageView({
	image:'../icons/beer-full.png',
	height:bigIcon,
	width:bigIcon,
	top:beerTop,
	left:lftFull+halfOffset
});
win.add(beeradd);

var beerremove = Titanium.UI.createImageView({
	image:'../icons/beer-empty.png',
	height:bigIcon,
	width:bigIcon,
	top:beerTop,
	left:lftEmpty+halfOffset
});
win.add(beerremove);

var beeradd_sml = Titanium.UI.createImageView({
	image:'../icons/beer-full.png',
	height:smlIcon,
	width:smlIcon,
	top:beerTop+bigIcon-smlIcon,
	left:lftFull
});
win.add(beeradd_sml);

var beerremove_sml = Titanium.UI.createImageView({
	image:'../icons/beer-empty.png',
	height:smlIcon,
	width:smlIcon,
	top:beerTop+bigIcon-smlIcon,
	left:lftEmpty
});
win.add(beerremove_sml);

var beercount = Ti.UI.createLabel({
	text:'0 pints',
	top:beerTop,
	left:lftDrinkType,
	width:100,
	height:bigIcon,
	textAlign:'center',
	color:'white'
});
win.add(beercount);


var wineadd = Titanium.UI.createImageView({
	image:'../icons/wine.png',
	height:bigIcon,
	width:bigIcon,
	top:wineTop,
	left:lftFull+halfOffset
});
win.add(wineadd);

var wineremove = Titanium.UI.createImageView({
	image:'../icons/wine-empty.png',
	height:bigIcon,
	width:bigIcon,
	top:wineTop,
	left:lftEmpty+halfOffset
});
win.add(wineremove);

var wineadd_sml = Titanium.UI.createImageView({
	image:'../icons/wine.png',
	height:smlIcon,
	width:smlIcon,
	top:wineTop+bigIcon-smlIcon,
	left:lftFull
});
win.add(wineadd_sml);

var wineremove_sml = Titanium.UI.createImageView({
	image:'../icons/wine-empty.png',
	height:smlIcon,
	width:smlIcon,
	top:wineTop+bigIcon-smlIcon,
	left:lftEmpty
});
win.add(wineremove_sml);

var winecount = Ti.UI.createLabel({
	text:'0 wines',
	top:wineTop,
	left:lftDrinkType,
	width:100,
	height:bigIcon,
	textAlign:'center',
	color:'white'
});
win.add(winecount);

var spiritadd = Titanium.UI.createImageView({
	image:'../icons/whiskey.png',
	height:bigIcon * 0.9,
	width:bigIcon * 0.9,
	top:spiritTop,
	left:lftFull+halfOffset
});
win.add(spiritadd);

var spiritremove = Titanium.UI.createImageView({
	image:'../icons/whiskey-empty.png',
	height:bigIcon * 0.9,
	width:bigIcon * 0.9,
	top:spiritTop,
	left:lftEmpty+halfOffset
});
win.add(spiritremove);

var spiritadd_sml = Titanium.UI.createImageView({
	image:'../icons/whiskey.png',
	height:smlIcon * 0.9,
	width:smlIcon * 0.9,
	top:spiritTop+bigIcon-smlIcon,
	left:lftFull
});
win.add(spiritadd_sml);

var spiritremove_sml = Titanium.UI.createImageView({
	image:'../icons/whiskey-empty.png',
	height:smlIcon * 0.9,
	width:smlIcon * 0.9,
	top:spiritTop+bigIcon-smlIcon,
	left:lftEmpty
});
win.add(spiritremove_sml);

var spiritcount = Ti.UI.createLabel({
	text:'0 spirits',
	top:spiritTop,
	left:lftDrinkType,
	width:100,
	height:bigIcon,
	textAlign:'center',
	color:'white'
});
win.add(spiritcount);



var UnitCount = Ti.UI.createLabel({
	text:'Total 0 units \n(Blood Alcohol 10mg)',
	top:250,
	left:lftDrinkType,
	width:180,
	height:bigIcon,
	textAlign:'center',
	color:'white'
});
win.add(UnitCount);


