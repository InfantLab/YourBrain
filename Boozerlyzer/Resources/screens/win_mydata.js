// create tab group
var tabGroup = Titanium.UI.createTabGroup({id:'tabGroupMyData'});

//
// create tab for personal / demographic data
//
var winpers = Titanium.UI.createWindow({ modal:true,
	url: '../screens/win_personal.js',
	titleid: 'win_personal',
	backgroundImage:'../images/smallcornercup.png'
});
var tabpers = Titanium.UI.createTab({
	title:'Personal Data',
    window:winpers
});


// create tab for privacy settings
//
var winprivacy = Titanium.UI.createWindow({ modal:true,
    url:'../screens/win_privacy.js',
	titleid:'win_privacy',
	backgroundImage:'../images/smallcornercup.png'
});
var tabprivacy = Titanium.UI.createTab({
	title:'Privacy settings',
    window:winprivacy
});

//
//  add tabs
//
tabGroup.addTab(tabpers);
tabGroup.addTab(tabprivacy);
//

tabGroup.setActiveTab(0); 
tabGroup.open({
	transition:Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
});