/**
 * @author Caspar Addyman
 * 
 * A modal user interface element to show the credits for the application
 * Copyright yourbrainondrugs.net 2011
 */


	var win;
	var labelTitle,messageLabel, booozerlyzerIcon, gameIcon, iconSize = 144;
	
	function createControls(){
		win = Titanium.UI.createWindow({
			title:'Credits',
			backgroundImage:'/images/smallcornercup.png',
			modal:true
		});	
		win.orientationModes =  [Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];	
	
		

	

		// 
		var labelTitle = Ti.UI.createLabel({
			top:4,
			width:'auto',
			text:'Credits & Acknowledgments',
			font:{fontSize:28,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'#911'
		});
		messageLabel = Ti.UI.createLabel({
			autoLink : Ti.UI.Android.LINKIFY_ALL,
			top:260,
			left:20,
			width:'auto',
			text:'Created by  ' + Titanium.App.getURL(),
			font:{fontSize:18,fontFamily:'Helvetic Neue',fontWeight:'italic'},
			textAlign:'center',
			color:'#000'		
		});
		booozerlyzerIcon = Ti.UI.createImageView({
			top:40,
			left:20,
			image:'/icons/ybob-logo2-sml.png',
			height:iconSize,
			width:iconSize
		});
		gameIcon = Ti.UI.createImageView({
			top:40,
			right:20,
			image:'/icons/appcelerator_logo-287x227.png',
			height:iconSize,
			width:iconSize
		});
		var labelCredits = Titanium.UI.createLabel({
			autoLink : Ti.UI.Android.LINKIFY_ALL,
			color:'#000',
			text:'Built with  http://appcelerator.com',
			font:{fontSize:18,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			right:20,
			width:'auto',
			top:260
		});
		win.add(labelCredits);

		win.add(labelTitle);
		win.add(messageLabel);
		win.add(booozerlyzerIcon);
		win.add(gameIcon);
	}

	/**
	 * Public API
	 */
	exports.open = function(){	
		createControls();
		win.open();
		Ti.API.debug('opened credits dialog');
	};
	exports.close = function(){
	
	};

	