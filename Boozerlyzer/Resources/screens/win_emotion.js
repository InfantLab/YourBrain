var win = Titanium.UI.currentWindow;

//layout variables
var lftLabels = 60;
var sizeIcon = 48;
var lftIcon = 10;
var lftSlider = 60
var widthSlider = 200
var rgtIcon = lftSlider + widthSlider + 5;
var topHappiness = 10;
var topEnergy = 90;
var topDrunk = 170;
var topLastEvent = 220;

//
// HAPPINESS SLIDER
//
var happinessLabel = Ti.UI.createLabel({
	text:'Happiness',
	top:topHappiness - 9,
	left:lftSlider,
	width:widthSlider,
	textAlign:'center'
});

var happinessLow = Titanium.UI.createImageView({
	image:'../icons/Sad.png',
	height:sizeIcon,
	width:sizeIcon,
	top:topHappiness,
	left:lftIcon
});
var happinessHigh = Titanium.UI.createImageView({
	image:'../icons/Happy.png',
	height:sizeIcon,
	width:sizeIcon,
	top:topHappiness,
	left:rgtIcon
});
var happiness = Titanium.UI.createSlider({
	min:0,
	max:100,
	value:50,
	width:widthSlider,
	top:topHappiness + 10,
	left:lftSlider
});
win.add(happinessLabel);
win.add(happinessLow);
win.add(happinessHigh);
win.add(happiness);

happiness.addEventListener('change',function(e)
{
//	happinessLabel.text = 'Happiness level = ' + Math.round(e.value) + ' act val ' + Math.round(happiness.value);
});
// For #806
happiness.addEventListener('touchstart', function(e)
{
	Ti.API.info('Touch started: '+e.value);
});
happiness.addEventListener('touchend', function(e)
{
	Ti.API.info('Touch ended: '+e.value);
});

//
// ENERGY SLIDER
//
var energyLabel = Ti.UI.createLabel({
	text:'Energy',
	top:topEnergy - 9,
	left:lftSlider,
	width:widthSlider,
	textAlign:'center'
});
var energyLow = Titanium.UI.createImageView({
	image:'../icons/OffLamp.png',
	height:sizeIcon,
	width:sizeIcon,
	top:topEnergy,
	left:lftIcon
});
var energyHigh = Titanium.UI.createImageView({
	image:'../icons/OnLamp.png',
	height:sizeIcon,
	width:sizeIcon,
	top:topEnergy,
	left:rgtIcon
});
var energy = Titanium.UI.createSlider({
	min:0,
	max:100,
	value:50,
	width:widthSlider,
	top:topEnergy + 10,
	left:lftSlider
});
win.add(energyLabel);
win.add(energyLow);
win.add(energyHigh);
win.add(energy);

energy.addEventListener('change',function(e)
{
	Ti.API.info('ENergy level = ' + Math.round(e.value) + ' act val ' + Math.round(energy.value));
});
// For #806
energy.addEventListener('touchstart', function(e)
{
	Ti.API.info('Touch started: '+ e.timestamp + '  val:' + e.value);
});
energy.addEventListener('touchend', function(e)
{
	Ti.API.info('Touch ended: '+ e.timestamp + '  val:' + e.value);
});

//
// DRUNKENESS SLIDER
//
var drunkenessLabel = Ti.UI.createLabel({
	text:'Drunkeness',
	top:topDrunk - 9,
	left:lftSlider,
	width:widthSlider,
	textAlign:'center'
});
var drunkSober = Titanium.UI.createImageView({
	image:'../icons/sober.png',
	height:sizeIcon,
	width:sizeIcon,
	top:topDrunk-10,
	left:lftIcon
});
//apologies for the following variable name!
var drunkDrunk = Titanium.UI.createImageView({
	image:'../icons/drunk.png',
	height:sizeIcon,
	width:sizeIcon,
	top:topDrunk+10,
	left:rgtIcon
});

var drunkeness = Titanium.UI.createSlider({
	min:0,
	max:100,
	value:50,
	width:widthSlider,
	top:topDrunk,
	left:lftSlider
});

drunkeness.addEventListener('change',function(e)
{
	var start = e.timestamp;
//	drunkenessLabel.text = 'Drunkeness Slider - value = ' + e.value;
});

win.add(drunkenessLabel);
win.add(drunkeness);
win.add(drunkSober);
win.add(drunkDrunk);

var lastchangedLabel = Ti.UI.createLabel({
	text:'Last Updated - 1:00pm, 2nd Jan 2011',
	top:topLastEvent,
	left:lftSlider,
	width:widthSlider,
	textAlign:'center'
});
	
	
var button = Ti.UI.createButton({
	title:'Save',
	top:topLastEvent,
	left:rgtIcon,
	width:80,
	height:24
});
win.add(button);

button.addEventListener('click',function()
{
	win.close();
});	
