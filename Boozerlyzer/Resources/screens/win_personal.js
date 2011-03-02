var win = Titanium.UI.currentWindow;

var minDate = new Date();
minDate.setFullYear(1900);
minDate.setMonth(1);
minDate.setDate(1);

var maxDate = new Date();
maxDate.setFullYear(1990);
maxDate.setMonth(12);
maxDate.setDate(31);

var value = new Date();
value.setFullYear(1980);
value.setMonth(6);
value.setDate(15);

var picker = Ti.UI.createPicker({
	useSpinner: true,
	type:Ti.UI.PICKER_TYPE_DATE,
	minDate:minDate,
	maxDate:maxDate,
	value:value
});

// turn on the selection indicator (off by default)
picker.selectionIndicator = true;

win.add(picker);

var label = Ti.UI.createLabel({
	text:'Enter birthdate',
	top:6,
	width:'150',
	height:'20',
	textAlign:'center',
	color:'white'
});
win.add(label);

picker.addEventListener('change',function(e)
{
	label.text = e.value;
});


//var gender = ['Female', 'Male', 'Private'];
//var weight_kg = ['30-5 kg', '35-40 kg', '40-5 kg', '45-50 kg','50-5 kg', '55-60 kg','60-5 kg', '65-70 kg','70-5 kg', '75-80 kg','80-5 kg', '85-90 kg','90-5 kg', '95-100 kg','100-5 kg', '105-110 kg','110-5 kg', '115-120 kg','120-5 kg', '125-130 kg', '130+ kg'];
//var weight_lb = ['80-90 lb', '90-100 lb', '100-110 lb', '110-120 lb','120-130 lb', '130-140 lb','140-150 lb', '150-160 lb','160-170 lb', '170-180 lb','180-190 lb', '190-200 lb','210-210 lb', '220-230 lb','230-240 lb', '240-250 lb','250-260 lb', '260-270 lb','270-280 lb', '280-290 lb', '300+ kg']
//
//var rows1 = [];
//for (var i = 0; i < gender.length; i++) {
//	rows1.push(Ti.UI.createPickerRow({title: gender[i]}));
//}
//
//var column1 = Ti.UI.createPickerColumn( {
//	rows: rows1
//});
//
//var sexpicker = Ti.UI.createPicker({
//	useSpinner: true, visibleItems: 3,
//	type : Ti.UI.PICKER_TYPE_PLAIN,
//	top: 150, height: 200,
//	columns:column1, 
//	font: {fontSize: "12"}
//});
//
//sexpicker.addEventListener('change', function(e) {
//	showStatus("you chose " + e.selectedValue[0]);
//});
//
//win.add(sexpicker);
