/**
 * @author Caspar Addyman
 * 
 * The personal data and privacy settinhs screen 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

exports.createApplicationWindow =function(){
	var win = Titanium.UI.createWindow({
		title:'YBOB Boozerlyzer',
		backgroundImage:'/images/smallcornercup.png',
		modal:true,
		orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	});	
	// create tab group
	var tabGroup = Titanium.UI.createTabGroup({id:'tabGroupMyData'});
	var mLaunchType = win.launchType;
	Titanium.API.debug('mydata - launchType:' + mLaunchType);
	
	//
	// create tab for personal / demographic data
	//
	var winpers = Titanium.UI.createWindow({ modal:true,
		url: '/win/win_personal.js',
		titleid: 'win_personal',
		backgroundImage:'/images/smallcornercup.png',
	    launchType:mLaunchType
	});
	var tabpers = Titanium.UI.createTab({
		title:'Personal Data',
	    window:winpers,
	    tabGroup:tabGroup
	});
	
	
	// create tab for privacy settings
	//
	var winprivacy = Titanium.UI.createWindow({ modal:true,
	    url:'/win/win_privacy.js',
		titleid:'win_privacy',
		backgroundImage:'/images/smallcornercup.png',
	    launchType:mLaunchType
	});
	var tabprivacy = Titanium.UI.createTab({
		title:'Privacy settings',
	    window:winprivacy,
	    tabGroup:tabGroup
	});

	
	//
	//  add tabs
	//
	tabGroup.addTab(tabpers);
	tabGroup.addTab(tabprivacy);
	if (Ti.App.Properties.getBool('Registered', true)){
		// create tab for registration settings
		// only show this tab if needed.
		var winregister = Titanium.UI.createWindow({ modal:true,
		    url:'/win/win_register.js',
			titleid:'win_register',
			backgroundImage:'/images/smallcornercup.png'
		});
		var tabregister = Titanium.UI.createTab({
			title:'Register',
		    window:winregister,
		    tabGroup:tabGroup
		});
		tabGroup.addTab(tabregister);			
	}else{
		// create tab for login
		// only show this tab if needed.
		var winSyncInfo = Titanium.UI.createWindow({ modal:true,
		    url:'/win/win_syncInfo.js',
			titleid:'win_syncInfo',
			backgroundImage:'/images/smallcornercup.png'
		});
		var tabSyncInfo = Titanium.UI.createTab({
			title:'Sync Info',
		    window:winSyncInfo,
		    tabGroup:tabGroup
		});
		tabGroup.addTab(tabSyncInfo);	
	}

	//default show personal details
	tabGroup.setActiveTab(0); 
	//exceptions
	if (!Titanium.App.Properties.getBool('PersonalDetailEntered', false)){
		//force show personal info tab
	}else if (!Titanium.App.Properties.getBool('PrivacySet', false)){
		//show privacy tab
		tabGroup.setActiveTab(1);
	}
	tabGroup.open();
	
	
	function returnToMainScreen(){
		if (Boozerlyzer.winHome === undefined || Boozerlyzer.winHome === null) {
			// Boozerlyzer.winHome = Boozerlyzer.win.main.createApplicationWindow();
			var winMain = Boozerlyzer.win.main.createApplicationWindow();
			Boozerlyzer.winHome = winMain;

		}
		win.close();
		Boozerlyzer.winHome.open();
	}
	

	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		Ti.API.debug('win_mydata android:back');
		returnToMainScreen();
	});
	
	return win;
};
