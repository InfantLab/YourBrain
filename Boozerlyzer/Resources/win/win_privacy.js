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
	
	var rows1 = [];
	for (var i = 0; i < netprivacy.length; i++) {
		rows1.push(Ti.UI.createPickerRow({title: netprivacy[i]}));
	}
	var column1 = Ti.UI.createPickerColumn({rows: rows1});
	
	var netpicker = Ti.UI.createPicker({
		useSpinner: true, visibleItems: 4,
		type : Ti.UI.PICKER_TYPE_PLAIN,
		top: 10, height: 90,
		columns:column1, 
		font: {fontSize: "12"}
	});
	netpicker.addEventListener('change', function(e) {
		Ti.API.debug("you chose " + e.selectedValue[0]);
	});
	win.add(netpicker);
	
	var rows2 = [];
	for (var i = 0; i < phoneprivacy.length; i++) {
		rows2.push(Ti.UI.createPickerRow({title: phoneprivacy[i]}));
	}
	var column2 = Ti.UI.createPickerColumn({rows:rows2});
	
	var phonepicker = Ti.UI.createPicker({
		useSpinner: true, visibleItems: 4,
		type : Ti.UI.PICKER_TYPE_PLAIN,
		top: 120, height: 90,
		columns:column2, 
		font: {fontSize: "12"}
	});
	phonepicker.addEventListener('change', function(e) {
		Ti.API.debug("you chose " + e.selectedValue[0]);
	});
	win.add(phonepicker);
	
	
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
// 		
		// var db = Titanium.Database.install('/ybob.db','ybob');
		// Titanium.API.debug('Installed new YBOB database')
		// db.close();

		// //quick fix		
		// var conn = Titanium.Database.install('ybob.db','ybob');
		// // conn.execute('UPDATE GameScores set UserID = 0 ');
		// // conn.execute('ALTER TABLE "main"."GameScores" ADD COLUMN "GameSteps" INTEGER');
		// conn.execute('ALTER TABLE "main"."GameScores" ADD COLUMN "Alcohol_ml" NUMERIC');
		// conn.execute('ALTER TABLE "main"."GameScores" ADD COLUMN "BloodAlcoholConc" NUMERIC');
		// conn.close();
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
			Ti.App.boozerlyzer.comm.exportGameData.exportCSV();
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