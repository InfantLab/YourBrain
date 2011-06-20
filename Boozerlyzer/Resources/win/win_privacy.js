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
	
		//reinstall the database - gets new structure but wipes ALL data.
		var db0 = Titanium.Database.install('/ybob.db','ybob');
		db0.remove();
		Titanium.API.debug('Removed old YBOB database')
		db0.close();
		
		var db = Titanium.Database.install('/ybob.db','ybob');
		Titanium.API.debug('Installed new YBOB database')
		db.close();
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
			backgroundImage:'/images/smallcornercup.png',
			modal:true		
		});
		win.close();
		newchart.open();
	});
	win.add(charttest);

	// //what username does this user connect to ybodnet with 
	// var userName = 
// 	
	// //label to let us know if we are connected 
	// var connectionStatus = Titanium.UI.createLabel({
// 		
	// })
 	
 	
	//
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (Ti.App.boozerlyzer.winHome === undefined 
			 || Ti.App.boozerlyzer.winHome === null) {
			Ti.App.boozerlyzer.winHome = Titanium.UI.createWindow({ modal:true,
				url: '/app.js',
				title: 'Boozerlyzer',
				backgroundImage: '/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			})
		}
		win.close();
		Ti.App.boozerlyzer.winHome.open();
	});
})();