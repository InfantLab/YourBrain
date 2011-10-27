/**
 * @author Caspar Addyman
 * 
 * The personal data and privacy settinhs screen 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

exports.createApplicationWindow =function(launchType){
	Ti.API.debug('creating win_mydata');
	var win = Titanium.UI.createWindow({
		title:'YBOB Boozerlyzer',
		backgroundImage:'/images/smallcornercup.png',
		modal:true,
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	});
	
	var viewPersonal = Boozerlyzer.win.personal.createApplicationWindow(launchType);
	var viewPrivacy = Boozerlyzer.win.privacy.createApplicationWindow(launchType);
	win.add(viewPersonal);
	win.add(viewPrivacy);
	viewPersonal.visible = true;
	viewPrivacy.visible = false;

	var viewComm, buttonCommText;
	//and do we show registration or sync screen?
	if (Ti.App.Properties.getBool('Registered', false)){
		viewComm =  Boozerlyzer.win.syncInfo.createApplicationWindow();
		buttonCommText = 'Sync';		
	}else{  
		// view registration settings
		viewComm =  Boozerlyzer.win.register.createApplicationWindow();
		buttonCommText = 'Register';	
					
	}
	win.add(viewComm);
	viewComm.visible = false;

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
	buttonPersonal.addEventListener('click', function(){
		viewPrivacy.hide();
		viewPersonal.show();
		viewComm.hide();
	})
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
	buttonPrivacy.addEventListener('click', function(){
		viewPrivacy.show();
		viewPersonal.hide();
		viewComm.hide();
	})
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
	buttonComm.addEventListener('click', function(){
		viewPrivacy.hide();
		viewPersonal.hide();
		viewComm.show();
	});
	win.add(buttonComm);
	
	

// 
	function goHome(){
		Ti.API.debug('win_mydata - gohome');
		if (Boozerlyzer.winHome === undefined || Boozerlyzer.winHome === null) {
			Boozerlyzer.winHome = Boozerlyzer.win.home.createApplicationWindow();
		}
		Boozerlyzer.winHome.open();
		Boozerlyzer.winMyData.close();
		Boozerlyzer.winHome.refresh();
	}

	//invisible button to return home over the cup
	var homeButton = Titanium.UI.createView({
								image:'/icons/transparenticon.png',
								bottom:0,
							    left:0,
							    width:30,
							    height:60
						    });
	win.add(homeButton);
	homeButton.addEventListener('click',goHome);
	// Cleanup and return home
	win.addEventListener('android:back', goHome);	
	win.addEventListener('close', goHome);
	
	return win;
};
