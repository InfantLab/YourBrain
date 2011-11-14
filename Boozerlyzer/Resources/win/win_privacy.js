/**
 * @author Caspar Addyman
 * 
 * The data privacy settinhs screen 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

exports.createApplicationWindow =function(launchType, parent){
	// var win = Titanium.UI.createWindow({
		// title:'YBOB Boozerlyzer',
		// backgroundImage:'/images/smallcornercup.png',
		// modal:true,
		// exitOnClose:false,
		// orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
	// });	
	var win = Titanium.UI.createView({
		top:'10%',
		height:'auto',
		left:0,
		width:'100%'
	});
	var winHome = win.home;
	var winMyDataAlias = parent;
	
	var mLaunchType;
	if (!launchType){
		 mLaunchType = launchType
	}
	var helpMessage = "Please indicate your preferred level of privacy.\nClick the buttons to change settings.";
	
	//include the menu choices	
	// Ti.include('/ui/menu.js');
	// var menu = menus;
	var menu = require('/ui/menu');
	//need to give it specific help for this screen
	menu.setHelpMessage(helpMessage);

	// var netprivacy = ['Send data with nickname', 'Send data with anonymous key','Send totally anonymous data' ,'Never send my data'];
	// var phoneprivacy = ['Store all data', 'Store games scores but not drinking data', 'Never store data'];	
	var netprivacy = ['Never send my data','Send data with nickname'];
	var phoneprivacy = ['Store all data', 'Erase data'];
	
	var netPrivacyLabel = Ti.UI.createLabel({
			text:'Network Privacy',
			top: 80,
			left:20,
			width:140,
			height:24,
			font:{fontSize:14},
			textAlign:'center',
			color:'black'	
	});
	win.add(netPrivacyLabel);
	

	var netPrivacyBtn= Ti.UI.createButton({
	    title:netprivacy[Titanium.App.Properties.getInt('NetPrivacy',1)],  
	    top:80,  
	    width:240,  
	    height:35,  
	    borderRadius:2,  
	    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14} 
	});
	win.add(netPrivacyBtn);
	var netPrivacyDialog = Titanium.UI.createOptionDialog({
		options:netprivacy,
		destructive:2,
		cancel:1,
		title:'Data sent to network'
	});
	// add event listener
	netPrivacyDialog.addEventListener('click',function(e)
	{
		netPrivacyBtn.text = netprivacy[e.index];
		Titanium.App.Properties.setInt('NetPrivacy',e.index);
		Titanium.App.Properties.setBool('PrivacySet', true)
		//TODO
		//ought to delete data, etc when privacy levels change.
	});
	netPrivacyBtn.addEventListener('click', function(e) {
		netPrivacyDialog.show();
	});

	var phonePrivacyLabel = Ti.UI.createLabel({
			text:'Phone Storage',
			top: 20,
			left:20,
			width:140,
			height:24,
			font:{fontSize:14},
			textAlign:'center',
			color:'black'	
	});
	win.add(phonePrivacyLabel);
	
	var phonePrivacyDialog = Titanium.UI.createOptionDialog({
		options:phoneprivacy,
		destructive:2,
		cancel:1,
		title:'Data stored on phone'
	});
	var phonePrivacyBtn= Ti.UI.createButton({
	    title:phoneprivacy[Titanium.App.Properties.getInt('PhonePrivacy',0)],  
	    top:20,  
	    width:240,  
	    height:35,  
	    borderRadius:2,  
	    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14} 
	});
	win.add(phonePrivacyBtn);
	// add event listener
	phonePrivacyDialog.addEventListener('click',function(e)
	{
		// phonePrivacyBtn.text = phoneprivacy[e.index];
		// Titanium.App.Properties.setInt('PhonePrivacy',e.index);
		//TODO
		//need to actually do something about this!
		if (e.index === 0){
			var deleteWarning = Ti.UI.createAlertDialog({
				 title: 'Delete all data?',
			    message: 'This feature is not implemented yet. To delete data go to your phone settings and use the Android Application manager',
			    buttonNames: ['OK']
			});
			deleteWarning.show();
		}
	});
	phonePrivacyBtn.addEventListener('click', function(e) {
		phonePrivacyDialog.show();
	});
		

	var exportData = Ti.UI.createButton({
		title:'Export data to SD Card',
		width:240,
		height:28,
		bottom:30
	});
	exportData.addEventListener('click',function()
	{
		Boozerlyzer.comm.exportData.exportTabFile();
	});	
	win.add(exportData);
	
	// function goHome(){
		// Ti.API.debug('win_personal goHome');
		// if (Boozerlyzer.winHome === undefined || Boozerlyzer.winHome === null) {
			// Boozerlyzer.winHome = Boozerlyzer.win.main.createApplicationWindow();
		// }
		// Boozerlyzer.winHome.open();
		// Boozerlyzer.tabMyData.hide();
		// Boozerlyzer.winHome.refresh();
	// }
	
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
		Titanium.App.Properties.setBool('PrivacySet', true);
		Titanium.App.Properties.setInt('RegistrationNag', 10);
		if(!Titanium.App.Properties.getBool('PersonalDetailEntered', false)){
			winMyDataAlias.showPersonal();
		}else if(!Titanium.App.Properties.getBool('Registered', false)){
			winMyDataAlias.showComm();
		}else{
			Titanium.App.Properties.setInt('RegistrationNag', -1);
			winMyDataAlias.goHome();			
		}
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
		winMyDataAlias.goHome();
	});		
	
	// Cleanup and return home
	win.addEventListener('android:back', winMyDataAlias.goHome);
	
	if (mLaunchType==="Welcome"){
		var alertDialog = Titanium.UI.createAlertDialog({
		    title: 'Boozerlyzer',
		    message: helpMessage,
		    buttonNames: ['OK']
		});
		alertDialog.show();
	}
	return win;
};
