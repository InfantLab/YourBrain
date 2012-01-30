/**
 * @author Caspar Addyman
 * 
 * The data privacy settinhs screen 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

exports.createApplicationWindow =function(launchType, parent){

	var win = Titanium.UI.createView({
		top:'10%',
		height:'auto',
		left:0,
		width:'100%'
	});
	var winHome = win.home;
	
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
	menu.setHelpContext(Titanium.Android.currentActivity);
		menu.setHelpMessage(helpMessage);

	// var netprivacy = ['Send data with nickname', 'Send data with anonymous key','Send totally anonymous data' ,'Never send my data'];
	// var phoneprivacy = ['Store all data', 'Store games scores but not drinking data', 'Never store data'];	
	var netprivacy = ['Send data with nickname','Never send my data'];
	var phoneprivacy = ['Store all data', 'Erase data'];
	
	var netPrivacyLabel = Ti.UI.createLabel({
		text:'Network Privacy',
		top: 100,
		left:20,
		width:140,
		height:24,
		font:{fontSize:14},
		textAlign:'center',
		color:'black'	
	});
	win.add(netPrivacyLabel);
	

	var netPrivacyBtn= Ti.UI.createButton({
	    title:netprivacy[Titanium.App.Properties.getInt('NetPrivacy',0)],  
	    top:120,  
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
		netPrivacyBtn.title = netprivacy[e.index];
		Titanium.App.Properties.setInt('NetPrivacy',e.index);
		Titanium.App.Properties.setBool('PrivacySet', true);
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
	    top:40,  
	    width:240,  
	    height:35,  
	    borderRadius:2,  
	    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14} 
	});
	win.add(phonePrivacyBtn);
	// add event listener
	phonePrivacyDialog.addEventListener('click',function(e)
	{
		//TODO
		//need to actually do something about this!
		if (e.index === 1){
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
		var commExportData = require('/comm/exportData');
		commExportData.exportTabFiles();
	});	
	win.add(exportData);
	

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
		if(!Titanium.App.Properties.getBool('PersonalDetailsEntered', false)){
			parent.showPersonal();
		}else if(!Titanium.App.Properties.getBool('Registered', false)){
			parent.showComm();
		}else{
			Titanium.App.Properties.setInt('RegistrationNag', -1);
			parent.goHome();			
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
		parent.goHome();
	});		
	
	// Cleanup and return home
	win.addEventListener('android:back', parent.goHome);
	
	win.addEventListener('show', function(){
		if (mLaunchType==="Welcome"){
			var alertDialog = Titanium.UI.createAlertDialog({
			    title: 'Boozerlyzer',
			    message: helpMessage,
			    buttonNames: ['OK']
			});
			alertDialog.show();
		}
	});
	return win;
};
