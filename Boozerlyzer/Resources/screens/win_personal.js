var win = Titanium.UI.currentWindow;
var winHome = win.home;

//layout variables
var topHW = 100;

Ti.include('../data/personalInfo.js','../js/datetimehelpers.js');

var persInfo = personalInfo.getData();

if (!persInfo){
	Titanium.API.debug('win_pers settingdata');
	persInfo = personalInfo.setDefaults();
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
	width:'120',
	height:'36',
	textAlign:'center',
	color:'white',
	backgroundColor:'black',
	borderColor:'grey',
	borderRadius:4
});
win.add(birthDate);

if (persInfo.BirthMonth > 0 && persInfo.BirthYear > 0){
	birthDate.text = monthname[persInfo.BirthMonth -1] + '-' + persInfo.BirthYear;
}
birthDate.addEventListener('click', function(){
	Ti.API.debug('Change birthday goes here..');
});

var nickName = Titanium.UI.createTextField({
	value:persInfo.Nickname,
	color:'#336699',
	hintText:'nickname',
	textAlign:'left',
	height:42,
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

// set a picker for gender.
var rows1 = [];
for (var i = 0; i < gender.length; i++) {
	rows1.push(Ti.UI.createPickerRow({title: gender[i]}));
}
var column1 = Ti.UI.createPickerColumn( {
	rows: rows1
});
var sexpicker = Ti.UI.createPicker({
	useSpinner: true, visibleItems: 3,
	type : Ti.UI.PICKER_TYPE_PLAIN,
	top: 40, height: 90,
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
	left:200,
	top:topHW+30,
	font:{fontSize:18,fontWeight:'bold'}	
});
win.add(heightUnit);
var rows2 = [];
var height = null;
if (persInfo.HeightUnits == 1){
	height = height_m;
	heightUnit.text = 'm'; 
}else{
	height = height_ft;	
	heightUnit.text = 'ft'; 
}
for (var i = 0; i < height.length; i++) {
	rows2.push(Ti.UI.createPickerRow({title: height[i]}));
}
var column2 = Ti.UI.createPickerColumn( {
	rows: rows2
});
var heightpicker = Ti.UI.createPicker({
	useSpinner: true, visibleItems: 3,
	type : Ti.UI.PICKER_TYPE_PLAIN,
	top: topHW,	left: 10,
	height: 90,
	columns:column2, 
	font: {fontSize: "12"}
});
heightpicker.setSelectedRow(0,persInfo.Height,false);
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
var rows3 = [];
var weight = null;
if (persInfo.WeightUnits == 1){
	weight = weight_kg;
	weightUnit.text = 'kg'; 
}else{
	weight = weight_lb;	
	weightUnit.text = 'lb'; 
}
for (var i = 0; i < weight.length; i++) {
	rows3.push(Ti.UI.createPickerRow({title: weight[i]}));
}
var column3 = Ti.UI.createPickerColumn( {
	rows: rows3
});
var weightpicker = Ti.UI.createPicker({
	useSpinner: true, visibleItems: 3,
	type : Ti.UI.PICKER_TYPE_PLAIN,
	top: topHW,	left:200,
	height: 90,
	columns:column3, 
	font: {fontSize: "12"}
});
weightpicker.setSelectedRow(0,persInfo.Weight,false);
weightpicker.addEventListener('change', function(e) {
	Titanium.API.debug('weight Changed');
	persInfo.Changed = true;
	persInfo.Weight = e.rowIndex;
});
win.add(weightpicker);



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
	personalInfo.setData(persInfo);
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

// Cleanup and return home
win.addEventListener('android:back', function(e) {
	if (winHome === undefined || winHome === null) {
		winHome = Titanium.UI.createWindow({ modal:true,
			url: '../app.js',
			title: 'Boozerlyzer',
			backgroundImage: '../images/smallcornercup.png',
			orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
		})
	}
	win.close();
	winHome.open();
});
