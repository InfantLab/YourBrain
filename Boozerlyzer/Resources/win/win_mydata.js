/**
 * @author Caspar Addyman
 * 
 * The personal data and privacy settinhs screen 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

var winpersonal = require('/win/win_personal');
var winprivacy = require('/win/win_privacy');
var winregister = require('/win/win_register');
var winsyncinfo = require('/win/win_syncInfo');
var winHome;
var winmain = require('/win/win_main');


exports.createApplicationWindow =function(launchType){
	Ti.API.debug('creating win_mydata');
	var win = Titanium.UI.createWindow({
		title:'YBOB Boozerlyzer',
		backgroundImage:'/images/smallcornercup.png',
		modal:true,
		// orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	});
	win.goHome = function (){
		Ti.API.debug('win_mydata - gohome');
		if (winHome === undefined) {
			winHome =  winmain.createApplicationWindow();
		}
		winHome.open();
		win.close();
		winHome.refresh();
	};
	win.orientationModes =  [Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];	
	var viewPersonal = winpersonal.createApplicationWindow(launchType, win, win.goHome);
	var viewPrivacy = winprivacy.createApplicationWindow(launchType, win);
	var viewComm, buttonCommText;
	win.add(viewPersonal);
	win.add(viewPrivacy);
	//and do we show registration or sync screen?
	if (Ti.App.Properties.getBool('Registered', false)){
		viewComm =  winsyncinfo.createApplicationWindow("normal", win);
		buttonCommText = 'Sync';		
	}else{  
		// view registration settings
		viewComm =  winregister.createApplicationWindow(launchType, win);
		buttonCommText = 'Register';	
					
	}
	win.add(viewComm);
	//work out which one to show by default
	viewPersonal.visible = false;
	viewPrivacy.visible = false;
	viewComm.visible = false;
	if (!Titanium.App.Properties.getBool('PersonalDetailsEntered', false)){
		viewPersonal.visible = true;
	}else if (!Titanium.App.Properties.getBool('PrivacySet', false)){
		viewPrivacy.visible = true;
	}else if (!Ti.App.Properties.getBool('Registered', false)){
		viewComm.visible = true;
	}else{
		viewPersonal.visible = true;
	}
	//add buttons to switch between them
	var buttonPersonal = Titanium.UI.createButton({
	    backgroundColor:'#336699',
	    top:0,
	    left:0,
	    width:'33%',
	    height:40,
	    title:'Personal Info',
	    borderRadius:3,
	    borderWidth:2,
	    borderColor:'#111'
	});
	win.showPersonal = function(){
		viewPrivacy.hide();
		viewPersonal.show();
		viewComm.hide();
	};
	buttonPersonal.addEventListener('click',win.showPersonal);
	win.add(buttonPersonal);
	
	var buttonPrivacy = Titanium.UI.createButton({
	    backgroundColor:'#336699',
	    top:0,
	    left:'33.5%',
	    width:'33%',
	    height:40,
	    title:'Privacy',
	    borderRadius:3,
	    borderWidth:2,
	    borderColor:'#111'
	});
	win.showPrivacy = function(){
		viewPrivacy.show();
		viewPersonal.hide();
		viewComm.hide();
	};
	buttonPrivacy.addEventListener('click', win.showPrivacy);
	win.add(buttonPrivacy);
		
	var buttonComm = Titanium.UI.createButton({
	    backgroundColor:'#336699',
	    top:0,
	    left:'67%',
	    width:'33%',
	    height:40, 
	    title:buttonCommText,
	    borderRadius:3,
	    borderWidth:2,
	    borderColor:'#111'
	});
	win.showComm = function(){
		viewPrivacy.hide();
		viewPersonal.hide();
		viewComm.show();
	};
	buttonComm.addEventListener('click', win.showComm);
	win.add(buttonComm);
	



	//invisible button to return home over the cup
	var homeButton = Titanium.UI.createView({
								image:'/icons/transparenticon.png',
								bottom:0,
							    left:0,
							    width:30,
							    height:60
						    });
	win.add(homeButton);
	homeButton.addEventListener('click',win.goHome);
	// Cleanup and return home
	win.addEventListener('android:back', win.goHome);	
	
	return win;
};
