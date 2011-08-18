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
	var topHW = 140, topNickname = 50, topSex = 10,topCountry = 10;
	var leftH = 80, leftW = 240, leftNickname = 40, leftSex = 215, leftCountry = 320;
	var bottomDOB =4, leftDOB =80; 
	//include the menu choices	
	Ti.include('/ui/menu.js');
	var menu = menus;
	//need to give it specific help for this screen
	menu.setHelpMessage("Please enter your personal information.\nClick on the Birth Date button to enter birth month and year. \nTo change from metric to imperial click on height (m) or weight (kg) units.");

	
	Ti.include('/ui/picker_monthyear.js');

	var Countries = Ti.App.boozerlyzer.db.alcoholStandardDrinks.get();
	Titanium.API.debug('win_personal - Countries' + Countries.length);
	
	var persInfo = Ti.App.boozerlyzer.db.personalInfo.getData();
	Ti.API.debug('win_personal - got persInfo');		
	if (!persInfo){
		Titanium.API.debug('win_personal settingdata');
		persInfo = Ti.App.boozerlyzer.db.personalInfo.setDefaults();
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
		bottom:bottomDOB,
		left:leftDOB,
		width:120,
		height:36,
		textAlign:'center',
		color:'white',
		backgroundColor:'black',
		borderColor:'#336699',
		borderRadius:4
	});
	win.add(birthDate);
	
	function updateDateOfBirth(){
		if (persInfo.BirthMonth > 0 && persInfo.BirthYear > 0){
			birthDate.text = Ti.App.boozerlyzer.db.personalInfo.monthname[persInfo.BirthMonth -1] + '-' + persInfo.BirthYear;
		}
	}
	
	birthDate.addEventListener('click', function(){
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
		top:topNickname,
		left:leftNickname,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		font:{fontSize:20,fontWeight:'bold'}
	});
	win.add(nickName);
	nickName.addEventListener('change', function(){
		persInfo.Changed = true;
		persInfo.Nickname = nickName.value;
		
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
		top: topCountry, height: 104,
		left: leftCountry ,
		columns:column0, 
		font: {fontSize: "12"}
	});
	var stdDrink = Ti.UI.createLabel({
		top:110,left:240,
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
	for (var i = 0; i < Ti.App.boozerlyzer.db.personalInfo.gender.length; i++) {
		rows1.push(Ti.UI.createPickerRow({title: Ti.App.boozerlyzer.db.personalInfo.gender[i]}));
	}
	var column1 = Ti.UI.createPickerColumn( {
		rows: rows1
	});
	var sexpicker = Ti.UI.createPicker({
		useSpinner: true, visibleItems: 3,
		type : Ti.UI.PICKER_TYPE_PLAIN,
		top: topSex, height: 104,
		left: leftSex,
		columns:column1, 
		font: {fontSize: "12"}
	});
	sexpicker.addEventListener('change', function(e) {
		persInfo.Changed = true;
		persInfo.Gender = e.rowIndex;
	});
	sexpicker.setSelectedRow(0,persInfo.Gender,true);
	win.add(sexpicker);
	
	//units for height
	var heightUnit = Ti.UI.createLabel({
		text:Ti.App.Properties.getString("HeightUnits",'m'),
		left:leftH + 100,
		top:topHW+10,
		font:{fontSize:18,fontWeight:'bold'}	
	});
	win.add(heightUnit);
	heightUnit.addEventListener('click',function (e){
		//change height units
		persInfo.Changed = true;
		heightUnit.text = (heightUnit.text==='m'? 'in': 'm');
		Ti.App.Properties.setString("HeightUnits", heightUnit.text);
		//convert the value
		heightField.value = ''+Ti.App.boozerlyzer.db.personalInfo.convertIntoNewUnits(heightField.value,heightUnit.text);
		validateHeight(); 
	});

	//units for weight.
	var weightUnit = Ti.UI.createLabel({
		text:Ti.App.Properties.getString("WeightUnits",'kg'),
		left:leftW + 100,
		top:topHW+10,
		font:{fontSize:18,fontWeight:'bold'}	
	});
	win.add(weightUnit);
	weightUnit.addEventListener('click',function (e){
		//change weight units
		persInfo.Changed = true;
		weightUnit.text = (weightUnit.text==='kg'? 'lb': 'kg');
		Ti.App.Properties.setString("WeightUnits", weightUnit.text);
		weightField.value = ''+Ti.App.boozerlyzer.db.personalInfo.convertIntoNewUnits(weightField.value,weightUnit.text);
		validateWeight(); 
	})

	var heightField = Titanium.UI.createTextField({
		value:'',
		color:'#336699',
		hintText:'height',
		textAlign:'left',
		height:42,
		top:topHW,
		left:leftH,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		font:{fontSize:18,fontWeight:'bold'}
	});
	heightField.addEventListener('blur', function(e) {
		if (initialised){
			Titanium.API.debug('height Changed');
			persInfo.Changed = true;
			validateHeight();
		}
	});
	win.add(heightField);
	//height might need converting before we display it.
	if (heightUnit.text ==='m'){
		heightField.value = persInfo.Height;		
	}else{//store value converted into kilo
		heightField.value = Ti.App.boozerlyzer.db.personalInfo.convertIntoNewUnits(persInfo.Height,'in');
	}
	var weightField = Titanium.UI.createTextField({
		value:'',
		color:'#336699',
		hintText:'weight',
		textAlign:'left',
		height:42,
		top:topHW,
		left:leftW,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
		font:{fontSize:18,fontWeight:'bold'}
	});
	weightField.addEventListener('blur', function(e) {
		if (initialised){
			Titanium.API.debug('weight Changed');
			persInfo.Changed = true;
			validateWeight();
		}
	});
	win.add(weightField);
	//height might need converting before we display it.
	if (weightUnit.text ==='kg'){
		weightField.value = persInfo.Weight;		
	}else{//store value converted into kilo
		weightField.value = Ti.App.boozerlyzer.db.personalInfo.convertIntoNewUnits(persInfo.Weight,'lb');
	}
	
	function validateHeight(){
		var newval,min,max;
		if (isNumber(heightField.value)){
			newval = 1*heightField.value;
		}else{
			heightField.value = '';
			persInfo.Height = null;
			return;
		}
		if (heightUnit.text ==='m'){
			min = Ti.App.boozerlyzer.db.personalInfo.minHeight_m;
			max = Ti.App.boozerlyzer.db.personalInfo.maxHeight_m;
		}else{
			min = Ti.App.boozerlyzer.db.personalInfo.minHeight_in;
			max = Ti.App.boozerlyzer.db.personalInfo.maxHeight_in;
		}
		newval = Math.max(min,newval);
		newval = Math.min(max,newval);
		newval = Ti.App.boozerlyzer.db.personalInfo.roundToStepSize(newval,heightUnit.text);		
		heightField.value = '' + newval;
		if (heightUnit.text ==='m'){
			persInfo.Height = newval;		
		}else{//store value converted into kilo
			persInfo.Height = Ti.App.boozerlyzer.db.personalInfo.convertIntoNewUnits(newval,'m');
		}
	}
	
	function isNumber(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function validateWeight(){
		Titanium.API.debug('validateweight 1');
		var newval,min,max;
		if (isNumber(weightField.value)){
			newval = 1*weightField.value;
		}else{
			weightField.value = '';
			persInfo.Weight = null;
			return;
		}
		if (weightUnit.text ==='kg'){
			min = Ti.App.boozerlyzer.db.personalInfo.minWeight_kg;
			max = Ti.App.boozerlyzer.db.personalInfo.maxWeight_kg;
		}else{
			min = Ti.App.boozerlyzer.db.personalInfo.minWeight_lb;
			max = Ti.App.boozerlyzer.db.personalInfo.maxWeight_lb;
		}
		newval = Math.max(min,newval);
		newval = Math.min(max,newval);
		Titanium.API.debug('validateweight 2');
		newval = Ti.App.boozerlyzer.db.personalInfo.roundToStepSize(newval,weightUnit.text);	
		weightField.value = '' + newval;
		if (weightUnit.text ==='kg'){
			persInfo.Weight = newval;		
		}else{
			//store value converted into kilo
			persInfo.Weight = Ti.App.boozerlyzer.db.personalInfo.convertIntoNewUnits(newval,'kg');
		}
		Titanium.API.debug('validateweight 3');
	}
	
	validateHeight();
	validateWeight();
	
	
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
		Ti.App.boozerlyzer.db.personalInfo.setData(persInfo);
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