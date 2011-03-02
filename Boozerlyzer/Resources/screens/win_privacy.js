var win = Titanium.UI.currentWindow;

Ti.API.info("Include accesspersonaldata js");
Ti.include("../data/accesspersonaldata.js");

var netprivacy = ['Never send my data', 'Send totally anonymous data', 'Send data with anonymous key', 'Send data with nickname'];
var phoneprivacy = ['Never store data', 'Store games scores but not drinking data', 'Store all data'];
//var weight_lb = ['80-90 lb', '90-100 lb', '100-110 lb', '110-120 lb','120-130 lb', '130-140 lb','140-150 lb', '150-160 lb','160-170 lb', '170-180 lb','180-190 lb', '190-200 lb','210-210 lb', '220-230 lb','230-240 lb', '240-250 lb','250-260 lb', '260-270 lb','270-280 lb', '280-290 lb', '300+ kg']
//
var rows1 = [];
for (var i = 0; i < netprivacy.length; i++) {
	rows1.push(Ti.UI.createPickerRow({title: netprivacy[i]}));
}
var column1 = Ti.UI.createPickerColumn({rows: rows1});

var netpicker = Ti.UI.createPicker({
	useSpinner: true, visibleItems: 4,
	type : Ti.UI.PICKER_TYPE_PLAIN,
	top: 50, height: 100,
	columns:column1, 
	font: {fontSize: "12"}
});
netpicker.addEventListener('change', function(e) {
	Ti.API.info("you chose " + e.selectedValue[0]);
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
	top: 200, height: 100,
	columns:column2, 
	font: {fontSize: "12"}
});
phonepicker.addEventListener('change', function(e) {
	Ti.API.info("you chose " + e.selectedValue[0]);
});
win.add(phonepicker);