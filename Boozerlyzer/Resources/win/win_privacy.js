/**
 * @author Caspar Addyman
 * 
 * The data privacy settinhs screen 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {
	
	var win = Titanium.UI.currentWindow;
	var winHome = win.home;
	
	var mLaunchType = win.launchType;
	var helpMessage = "Please indicate your preferred level of privacy.\nClick the buttons to change settings.";
	
	//include the menu choices	
	Ti.include('/ui/menu.js');
	var menu = menus;
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
	
	var debug = Titanium.UI.createImageView({
		image:'/icons/Misc.png',
		height:48,
		width:48,
		top:60,
		right:10
	});
	debug.addEventListener('click',function(){
	
		// //reinstall the database - gets new structure but wipes ALL data.
		// var db0 = Titanium.Database.install('/ybob.db','ybob');
		// db0.remove();
		// Titanium.API.debug('Removed old YBOB database')
		// db0.close();

		// var db = Titanium.Database.install('/ybob.db','ybob');
		// Titanium.API.debug('Installed new YBOB database')
		// db.close();

		// //quick fix		
		// varTi.App.boozerlyzer.db.conn = Titanium.Database.install('ybob.db','ybob');
		// //Ti.App.boozerlyzer.db.conn.execute('UPDATE GameScores set UserID = 0 ');
		// //Ti.App.boozerlyzer.db.conn.execute('ALTER TABLE "main"."GameScores" ADD COLUMN "GameSteps" INTEGER');
		//Ti.App.boozerlyzer.db.conn.execute('ALTER TABLE "main"."GameScores" ADD COLUMN "Alcohol_ml" NUMERIC');
		//Ti.App.boozerlyzer.db.conn.execute('ALTER TABLE "main"."GameScores" ADD COLUMN "BloodAlcoholConc" NUMERIC');
		//Ti.App.boozerlyzer.db.conn.close();
		// //Ti.App.boozerlyzer.db.conn.execute('ALTER TABLE "main"."GameScores" ADD COLUMN "GameSteps" INTEGER');
		
	});
	win.add(debug);
	
	var charttest = Titanium.UI.createImageView({
		image:'/icons/line_chart.png',
		height:48,
		width:48,
		top:120,
		right:10
	});
	charttest.addEventListener('click',function(){
		var newchart = Titanium.UI.createWindow({ modal:true,
			url:'/win/win_results2.js',
			title:'How are you feeling?',
			backgroundImage:'/images/smallcornercup.png'
		});
		win.close();
		newchart.open();
	});
	win.add(charttest);

	var exportData = Ti.UI.createButton({
		title:'Export data to SD Card',
		width:240,
		height:28,
		bottom:30
	});
	exportData.addEventListener('click',function()
	{
		Ti.App.boozerlyzer.comm.exportData.exportTabFile();
	});	
	win.add(exportData);
		
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (Ti.App.boozerlyzer.winHome === undefined  || Ti.App.boozerlyzer.winHome === null) {
			Ti.App.boozerlyzer.winHome = Titanium.UI.createWindow({ modal:true,
				url: '/app.js',
				title: 'Boozerlyzer',
				backgroundImage: '/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});
		}
		win.close();
		Ti.App.boozerlyzer.winHome.open();
	});
	
	if (mLaunchType==="Welcome"){
		var alertDialog = Titanium.UI.createAlertDialog({
		    title: 'Boozerlyzer',
		    message: helpMessage,
		    buttonNames: ['OK']
		});
		alertDialog.show();
	}
})();