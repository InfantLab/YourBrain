/**
 * @author Caspar Addyman
 * 
 * The personal data and privacy settinhs screen 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

exports.createApplicationWindow =function(launchType){
	Ti.API.debug('creating win_mydata');

	var tabGroup = Titanium.UI.createTabGroup({id:'tabGroupMyData'});
	
	// create tab for personal / demographic data
	Boozerlyzer.winPers = Boozerlyzer.win.personal.createApplicationWindow(launchType);
	var tabpers = Titanium.UI.createTab({
		title:'Personal Data',
	    window:Boozerlyzer.winPers ,
	    tabGroup:tabGroup
	});	
	// create tab for privacy settings
	Boozerlyzer.winPrivacy =  Boozerlyzer.win.privacy.createApplicationWindow(launchType);
	var tabprivacy = Titanium.UI.createTab({
		title:'Privacy settings',
	    window:Boozerlyzer.winPrivacy,
	    tabGroup:tabGroup
	});
	//  add tabs
	tabGroup.addTab(tabpers);
	tabGroup.addTab(tabprivacy);
	
	if (Ti.App.Properties.getBool('Registered', true)){
		// create tab for registration settings
		// only show this tab if needed.
		Boozerlyzer.winRegister =  Boozerlyzer.win.register.createApplicationWindow();
		var tabregister = Titanium.UI.createTab({
			title:'Register',
		    window:Boozerlyzer.winRegister,
		    tabGroup:tabGroup
		});
		tabGroup.addTab(tabregister);			
	}else{
		// create tab for login
		// only show this tab if needed.
		Boozerlyzer.winSyncInfo = Titanium.UI.createApplicationWindow();
		var tabSyncInfo = Titanium.UI.createTab({
			title:'Sync Info',
		    window:Boozerlyzer.winSyncInfo,
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
	
	
	function goHome(){
		Ti.API.debug('win_mydata - gohome');
		if (Boozerlyzer.winHome === undefined || Boozerlyzer.winHome === null) {
			Boozerlyzer.winHome = Boozerlyzer.win.home.createApplicationWindow();
		}
		Boozerlyzer.winHome.open();
		tabGroup.close();
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
	tabGroup.add(homeButton);
	homeButton.addEventListener('click',goHome);
	// Cleanup and return home
	tabGroup.addEventListener('android:back', goHome);	
	tabGroup.addEventListener('close', goHome);
	return tabGroup;
};
