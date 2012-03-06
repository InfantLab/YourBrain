/**
 * @author Caspar Addyman
 * 
 * A modal user interface element to show the credits for the application
 * Copyright yourbrainondrugs.net 2011
 */


	var win;
	var e, callbackOnClose, isControlsCreated = false;
	var containerViewOpenAnimation, containerViewCloseAnimation;
	var coverViewOpenAnimation, coverViewCloseAnimation;
	var containerView, coverView;
	var messageLabel, gameIcon, labPointsIcon, iconSize = 78;
	
	function createControls(){
		if (isControlsCreated) {return;}

		coverViewOpenAnimation = Ti.UI.createAnimation({opacity:0.8});
		coverViewCloseAnimation = Ti.UI.createAnimation({opacity:0});
		containerViewOpenAnimation = Ti.UI.createAnimation({bottom:0});
		containerViewCloseAnimation = Ti.UI.createAnimation({bottom:-251});

		containerView = Ti.UI.createView({
			top:'5%',
			left:'5%',
			height:'90%',
			width:'90%',
			zIndex:9
		});
		containerView.addEventListener('click', function(){
			exports.close();
		});		
		
		coverView = Ti.UI.createView({
			top:'5%',
			left:'5%',
			height:'90%',
			width:'90%',
			backgroundColor:'#000',
			opacity:1,
			borderRadius:4,
			borderWidth:4 ,
			zIndex:0
		});
		// we close this dialog if it is clicked anywhere
		coverView.addEventListener('click', function(){
			//e.cancel = true;
			exports.close();
		});		
		win.add(coverView);
		
		var labelCredits = Titanium.UI.createLabel({
			autoLink : Ti.UI.Android.LINKIFY_ALL,
			color:'#000',
			text:'Created by  ' + Titanium.App.getURL() + '\nBuilt with  http://appcelerator.com',
			font:{fontSize:12,fontFamily:'Helvetica Neue'},
			textAlign:'center',
			right:00,
			width:240,
			bottom:30
		});
		homeWin.add(labelCredits);
	

		// 
		var labelTitle = Ti.UI.createLabel({
			top:2,
			width:'auto',
			text:'Credits & Acknowledgments',
			font:{fontSize:28,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'#911'
		});
		messageLabel = Ti.UI.createLabel({
			top:200,
			width:'auto',
			text:'Well played!',
			font:{fontSize:18,fontFamily:'Helvetic Neue',fontWeight:'italic'},
			textAlign:'center',
			color:'#000'		
		});
		booozerlyzerIcon = Ti.UI.createImageView({
			bottom:'6%',
			right:'25%',
			image:'/icons/.png',
			height:iconSize * 0.8,
			width:iconSize * 0.8
		});
		gameIcon = Ti.UI.createImageView({
			top:'1%',
			left:'1%',
			image:'/icons/appcelerator_logo-287x227.png',
			height:iconSize,
			width:iconSize
		});


		containerView.add(labPointsLabel);
		containerView.add(messageLabel);
		containerView.add(gameIcon);
		containerView.add(labPointsIcon);
		win.add(containerView);		
		
		isControlsCreated = true;
	}

	/**
	 * Public API
	 */
	exports.setParent = function (window){
		win = window;
		isControlsCreated = false;
	};
	exports.open = function(){	
		coverView.animate(coverViewOpenAnimation);
		containerView.animate(containerViewOpenAnimation);
		containerView.visible = true;
	};
	exports.close = function(){
		coverView.animate(coverViewCloseAnimation);
		containerView.animate(containerViewCloseAnimation);
		containerView.visible = false;
		if (callbackOnClose){
			callbackOnClose(e);
		}
	};



	exports.addEventListener = function(eventName, callback){
		if (eventName=='close') {callbackOnClose = callback;}
	};
