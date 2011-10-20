/**
 * @author Caspar Addyman
 * 
 * The personal data and privacy settinhs screen 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {
	
	var win = Titanium.UI.currentWindow;
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
		var winlogin = Titanium.UI.createWindow({ modal:true,
		    url:'/win/win_login.js',
			titleid:'win_login',
			backgroundImage:'/images/smallcornercup.png'
		});
		var tablogin = Titanium.UI.createTab({
			title:'Log In',
		    window:winlogin,
		    tabGroup:tabGroup
		});
		tabGroup.addTab(tablogin);	
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
		if (Ti.App.boozerlyzer.winHome === undefined || Ti.App.boozerlyzer.winHome === null) {
			// Ti.App.boozerlyzer.winHome = Ti.App.boozerlyzer.win.main.createApplicationWindow();
			var winMain = Ti.App.boozerlyzer.win.main.createApplicationWindow();
			Ti.App.boozerlyzer.winHome = winMain;

		}
		win.close();
		Ti.App.boozerlyzer.winHome.open();
	}
	

	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		Ti.API.debug('win_mydata android:back');
		returnToMainScreen();
	});
	
})();