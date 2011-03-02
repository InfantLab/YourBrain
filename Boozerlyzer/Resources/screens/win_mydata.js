var win = Titanium.UI.currentWindow;

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

//
// create tab for personal / demographic data
//
var winpers = Titanium.UI.createWindow({
    url:'win_personal.js',
    id:'personaldata',
	titleid:'A'
});
var tabpers = Titanium.UI.createTab({
	title:'Personal Data',
	titleid:'A',
    window:winpers
});


// create tab for privacy settings
//
var winprivacy = Titanium.UI.createWindow({
    url:'win_privacy.js',
    titleid:'privacy',
	titleid:'b'
});
var tabprivacy = Titanium.UI.createTab({
	title:'Privacy settings',
    window:winprivacy,
	titleid:'b'
});



//
//  add tabs
//
tabGroup.addTab(tabpers);
tabGroup.addTab(tabprivacy);
//
//
//tabGroup.setActiveTab(1); 
//
win.add(tabGroup);






