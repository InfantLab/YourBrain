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
	//include the menu choices	
	Ti.include('/ui/menu.js');
	var menu = menus;
	//need to give it specific help for this screen
	menu.setHelpMessage("Please indicate your preferred level of privacy.");

	var netprivacy = ['Never send my data', 'Send totally anonymous data', 'Send data with anonymous key', 'Send data with nickname'];
	var phoneprivacy = ['Never store data', 'Store games scores but not drinking data', 'Store all data'];
	
	
	var netPrivacyLabel = Ti.UI.createLabel({
			text:'Network Privacy',
			top: 120,
			left:20,
			width:100,
			height:24,
			textAlign:'center',
			color:'black'	
	});
	win.add(netPrivacyLabel);
	
	var netPrivacyDialog = Titanium.UI.createOptionDialog({
		options:netprivacy,
		destructive:2,
		cancel:1,
		title:'Set communications privacy.'
	});
	// add event listener
	netPrivacyDialog.addEventListener('click',function(e)
	{
	
		netPrivacyBtn.text = netprivacy[e.index];
		//TODO
		//need to actually do something about this!
	});
		var netPrivacyBtn= Ti.UI.createButton({
	    title:netprivacy[0],  
	    top:120,  
	    width:180,  
	    height:35,  
	    borderRadius:2,  
	    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14} 
	});
	win.add(netPrivacyBtn);
	netPrivacyBtn.addEventListener('click', function(e) {
		netPrivacyDialog.show();
	});

	var phonePrivacyLabel = Ti.UI.createLabel({
			text:'Handset Privacy',
			top: 20,
			left:20,
			width:100,
			height:24,
			textAlign:'center',
			color:'black'	
	});
	win.add(netPrivacyLabel);
	
	var phonePrivacyDialog = Titanium.UI.createOptionDialog({
		options:phoneprivacy,
		destructive:2,
		cancel:1,
		title:'Data stored on phone'
	});
	// add event listener
	phonePrivacyDialog.addEventListener('click',function(e)
	{
		phonePrivacyBtn.text = phoneprivacy[e.index];
		//TODO
		//need to actually do something about this!
	});
	var phonePrivacyBtn= Ti.UI.createButton({
	    title:phoneprivacy[0],  
	    top:20,  
	    width:180,  
	    height:35,  
	    borderRadius:2,  
	    font:{fontFamily:'Arial',fontWeight:'bold',fontSize:14} 
	});
	win.add(phonePrivacyBtn);
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
			title:'Save to SD Card',
			width:200,
			height:28,
			bottom:30,
			right:10,
			backgroundColor:'gray'
		});
		exportData.addEventListener('click',function()
		{
			Ti.App.boozerlyzer.comm.exportData.exportTabFile();
		});	
		win.add(exportData);
		
	//
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
})();