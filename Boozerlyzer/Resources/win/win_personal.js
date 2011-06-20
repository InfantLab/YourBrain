/**
 * @author Caspar Addyman
 * 
 * The personal data  settinhs screen.
 * Here we can set height, age, weight and nickname 
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {	

	var win = Titanium.UI.currentWindow;
	var initialised = false;
	//layout variables
	var topHW = 100;
	
	Ti.include('/ui/picker_monthyear.js');

	var Countries = Ti.App.boozerlyzer.data.alcoholStandardDrinks.get();
	Titanium.API.debug('win_personal - Countries' + Countries.length);
	
	var persInfo = Ti.App.boozerlyzer.data.personalInfo.getData();
	Ti.API.debug('win_personal - got persInfo');		
	if (!persInfo){
		Titanium.API.debug('win_personal settingdata');
		persInfo = Ti.App.boozerlyzer.data.personalInfo.setDefaults();
	}
	
	var label = Titanium.UI.createLabel({
		text:'About you..',
		left:10,
		top:5,
		font:{fontSize:24,fontWeight:'bold'}
	});
	win.add(label);
	
	var birthDate = Ti.UI.createLabel({
		text:'Birth Date..',
		bottom:5,
		left:80,
		width:120,
		height:36,
		textAlign:'center',
		color:'white',
		backgroundColor:'black',
		borderColor:'grey',
		borderRadius:4
	});
	win.add(birthDate);
	
	function updateDateOfBirth(){
		if (persInfo.BirthMonth > 0 && persInfo.BirthYear > 0){
			birthDate.text = Ti.App.boozerlyzer.data.personalInfo.monthname[persInfo.BirthMonth -1] + '-' + persInfo.BirthYear;
		}
	}
	
	birthDate.addEventListener('click', function(){
		Ti.API.debug('Change birthday goes here..');
		var monthYear = [persInfo.BirthMonth,persInfo.BirthYear];
		monthYearPickerDialog.setBirthMonthYear(1920,1999,monthYear);
		monthYearPickerDialog.open();
	});

	// Respond when selection made and dialog closed
	monthYearPickerDialog.addEventListener('close', function(e){
		    if (e.done==true){
		        Ti.API.debug('e.month '+ e.month );
		        Ti.API.debug('e.year' + e.year);
		        persInfo.Changed = true;
		        persInfo.BirthMonth = e.month;
		        persInfo.BirthYear = e.year;
				updateDateOfBirth();
		    }
		});
	
	
	
	var nickName = Titanium.UI.createTextField({
		value:persInfo.Nickname,
		color:'#336699',
		hintText:'nickname',
		textAlign:'left',
		height:52,
		top:10,
		left:150,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		font:{fontSize:20,fontWeight:'bold'}
	});
	win.add(nickName);
	nickName.addEventListener('change', function(){
		persInfo.Changed = true;
		persInfo.Nickname = nickName.value;
		Titanium.API.debug('nickName Changed');
	});

	// set a picker for country/standard drinks.
	var rows0 = [];
	for (var i = 0; i < Countries.length; i++) {
		rows0.push(Ti.UI.createPickerRow({
			title: Countries[i].Country,
			gperunit:Countries[i].GramsPerUnit,
			mlperunit:Countries[i].MillilitresPerUnit
		}));
	}
	var column0 = Ti.UI.createPickerColumn( {
		rows: rows0
	});
	var countrypicker = Ti.UI.createPicker({
		useSpinner: true, visibleItems: 3,
		type : Ti.UI.PICKER_TYPE_PLAIN,
		top: 10, height: 90,
		right: 20 ,
		columns:column0, 
		font: {fontSize: "12"}
	});
	var stdDrink = Ti.UI.createLabel({
		top:100,left:240,
		text:'1 Standard Drink = 10 mls alcohol'
	})
	win.add(stdDrink);
	countrypicker.addEventListener('change', function(e) {
		if (initialised){
			persInfo.Changed = true;
			persInfo.Country = Countries[e.rowIndex].Country;
			stdDrink.text = '1 Standard Drink = ' +  Countries[e.rowIndex].MillilitresPerUnit + ' ml Alc.';
		}
	});
	for(var i= 0;i< Countries.length; i++){
		if (persInfo.Country === Countries[i].Country){
			countrypicker.setSelectedRow(0,i,true);	
			stdDrink.text = '1 Standard Drink = ' +  Countries[i].MillilitresPerUnit + ' ml Alc.';
		}
	}
	
	win.add(countrypicker);
		
	// set a picker for gender.
	var rows1 = [];
	for (var i = 0; i < Ti.App.boozerlyzer.data.personalInfo.gender.length; i++) {
		rows1.push(Ti.UI.createPickerRow({title: Ti.App.boozerlyzer.data.personalInfo.gender[i]}));
	}
	var column1 = Ti.UI.createPickerColumn( {
		rows: rows1
	});
	var sexpicker = Ti.UI.createPicker({
		useSpinner: true, visibleItems: 3,
		type : Ti.UI.PICKER_TYPE_PLAIN,
		top: 40, height: 90,
		left: 20,
		columns:column1, 
		font: {fontSize: "12"}
	});
	sexpicker.addEventListener('change', function(e) {
		persInfo.Changed = true;
		persInfo.Gender = e.rowIndex;
	});
	sexpicker.setSelectedRow(0,persInfo.Gender,true);
	win.add(sexpicker);
	
	// set a picker for height.
	var heightUnit = Ti.UI.createLabel({
		text:'m',
		left:180,
		top:topHW+30,
		font:{fontSize:18,fontWeight:'bold'}	
	});
	win.add(heightUnit);
	heightUnit.addEventListener('click',function (e){
		//change height units
		persInfo.Changed = true;
		persInfo.HeightUnits = (persInfo.HeightUnits===1? 0: 1);
		fillHeight(); 
	})
	
	function fillHeight(){
		var rows2 = [];
		var height = null;
		if (persInfo.HeightUnits == 1){
			height = Ti.App.boozerlyzer.data.personalInfo.height_m;
			heightUnit.text = 'm'; 
		}else{
			height = Ti.App.boozerlyzer.data.personalInfo.height_ft;	
			heightUnit.text = 'ft'; 
		}
		rows2 = [];
		for (var i = 0; i < height.length; i++) {
			rows2.push(Ti.UI.createPickerRow({title: height[i]}));
		}	
		columnheight = Ti.UI.createPickerColumn( {
			rows: rows2
		});
		heightpicker.columns = columnheight;
		heightpicker.setSelectedRow(0,persInfo.Height,false);
	
	}
	function fillWeight(){
		var rows2 = [];
		var Weight = null;
		if (persInfo.WeightUnits == 1){
			weight = Ti.App.boozerlyzer.data.personalInfo.weight_kg;
			weightUnit.text = 'kg'; 
		}else{
			weight = Ti.App.boozerlyzer.data.personalInfo.weight_lb;	
			weightUnit.text = 'lb'; 
		}
		rows2 = [];
		for (var i = 0; i < weight.length; i++) {
			rows2.push(Ti.UI.createPickerRow({title: weight[i]}));
		}	
		columnweight = Ti.UI.createPickerColumn( {
			rows: rows2
		});
		weightpicker.columns = columnweight;
		weightpicker.setSelectedRow(0,persInfo.Weight,false);
	}
	
	var heightpicker = Ti.UI.createPicker({
		useSpinner: true, visibleItems: 3,
		type : Ti.UI.PICKER_TYPE_PLAIN,
		top: topHW,	left: 10,
		height: 90, width:165,
		font: {fontSize: "12"}
	});
	heightpicker.addEventListener('change', function(e) {
		persInfo.Changed = true;
		persInfo.Height = e.rowIndex;
		Titanium.API.debug('Height Changed');
	});
	win.add(heightpicker);
	
	
	// set a picker for weight.
	var weightUnit = Ti.UI.createLabel({
		text:'kg',
		left:400,
		top:topHW + 30,
		font:{fontSize:18,fontWeight:'bold'}	
	});
	win.add(weightUnit);
	weightUnit.addEventListener('click',function (e){
		//change height units
		persInfo.Changed = true;
		persInfo.WeightUnits = (persInfo.WeightUnits===1? 0: 1);
		fillWeight(); 
	})
	
	var weightpicker = Ti.UI.createPicker({
		useSpinner: true, visibleItems: 3,
		type : Ti.UI.PICKER_TYPE_PLAIN,
		top: topHW,	left:200,
		height: 90,width:170,
		font: {fontSize: "12"}
	});
	weightpicker.addEventListener('change', function(e) {
		Titanium.API.debug('weight Changed');
		persInfo.Changed = true;
		persInfo.Weight = e.rowIndex;
	});
	win.add(weightpicker);
	
	fillHeight();
	fillWeight();
	
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
		Ti.App.boozerlyzer.data.personalInfo.setData(persInfo);
		win.close();
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
		win.close();
	});	
	
	updateDateOfBirth();
	// // Cleanup and return home
	// win.addEventListener('android:back', function(e) {
		// if (winHome === undefined || winHome === null) {
			// winHome = Titanium.UI.createWindow({ modal:true,
				// url: '/app.js',
				// title: 'Boozerlyzer',
				// backgroundImage: '/images/smallcornercup.png',
				// orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			// })
		// }
		// win.close();
		// winHome.open();
	// });
	initialised = true;
})();