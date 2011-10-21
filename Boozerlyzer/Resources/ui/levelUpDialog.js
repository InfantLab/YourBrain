/**
 * @author Caspar Addyman
 * 
 * A modal user interface element for informing users that they have
 * graduated to the next level. Show them their new icon, 
 * 
 * We wrap all code in a self-calling function to protect the global namespace.
 * 
 * TODO - potential this could be passed a gameScores data structure.
 * Copyright yourbrainondrugs.net 2011
 */


var levelUpDialog = (function(){
	var e, callbackOnClose, isControlsCreated = false;
	var containerViewOpenAnimation, containerViewCloseAnimation;
	var coverViewOpenAnimation, coverViewCloseAnimation;
	var containerView, coverView;
	var gameNameLabel,scoreLabel,speedBonusLabel,coordBonusLabel,inhibitBonusLabel,labPointsLabel;
	var messageLabel, gameIcon, labPointsIcon, iconSize = 78;
	var api = {};
	
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
			//e.cancel = true;
			api.close();
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
			api.close();
		});		
		Ti.UI.currentWindow.add(coverView);

		// game results
		gameNameLabel = Ti.UI.createLabel({
			top:2,
			width:'auto',
			text:'Score',
			font:{fontSize:28,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'#911'
		});
		scoreLabel = Ti.UI.createLabel({
			top:40,
			width:'auto',
			text:'Score    -   00000 points',
			font:{fontSize:24,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'#191'
		});
		speedBonusLabel = Ti.UI.createLabel({
			top:80,
			width:'auto',
			text:'Speed Bonus    :      000 points',
			font:{fontSize:18,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'#119'
		});
		coordBonusLabel = Ti.UI.createLabel({
			top:120,
			width:'auto',
			text:'Coord Bonus    :      000 points',
			font:{fontSize:18,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'#119'
		});
		inhibitBonusLabel = Ti.UI.createLabel({
			top:160,
			width:'auto',
			text:'Control Bonus    :      000 points',
			font:{fontSize:18,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'#119'
		});
		messageLabel = Ti.UI.createLabel({
			top:200,
			width:'auto',
			text:'Well played!',
			font:{fontSize:18,fontFamily:'Helvetic Neue',fontWeight:'italic'},
			textAlign:'center',
			color:'#000'		
		});
		labPointsLabel = Ti.UI.createLabel({
			bottom:'7%',
			right:'45%',
			width:'auto',
			text:'0\n Lab Points',
			font:{fontSize:22,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'cyan'
		});
		labPointsIcon = Ti.UI.createImageView({
			bottom:'6%',
			right:'25%',
			image:'/icons/hamsterwheel.png',
			height:iconSize * 0.8,
			width:iconSize * 0.8
		});
		gameIcon = Ti.UI.createImageView({
			top:'1%',
			left:'1%',
			image:'/icons/hamsterwheel.png',
			height:iconSize,
			width:iconSize
		});

		containerView.add(gameNameLabel);
		containerView.add(scoreLabel);
		containerView.add(speedBonusLabel);
		containerView.add(coordBonusLabel);
		containerView.add(inhibitBonusLabel);
		containerView.add(labPointsLabel);
		containerView.add(messageLabel);
		containerView.add(gameIcon);
		containerView.add(labPointsIcon);
		Ti.UI.currentWindow.add(containerView);		
		
		isControlsCreated = true;
	}

	/**
	 * Public API
	 */
	api.open = function(){	
		coverView.animate(coverViewOpenAnimation);
		containerView.animate(containerViewOpenAnimation);
		containerView.visible = true;
	};
	api.close = function(){
		coverView.animate(coverViewCloseAnimation);
		containerView.animate(containerViewCloseAnimation);
		containerView.visible = false;
		if (callbackOnClose){
			callbackOnClose(e);
		}
	};

	/***
	 * fill the fields with the scores.
	 * 
	 */
	api.setScores = function(gameName, totalScore, speedBonus, coordBonus,inhibitBonus, labPoints, message,gameIconUrl){
		createControls();
		gameNameLabel.text = gameName;
		scoreLabel.text = "Score:      " + Math.round(totalScore) + " points";
		speedBonusLabel.text = "Speed bonus:     " + Math.round(speedBonus) + " points";
		coordBonusLabel.text = "Coordination bonus:     " + Math.round(coordBonus) + " points";
		inhibitBonusLabel.text = "Control Bonus:      " + Math.round(inhibitBonus) + " points";
		labPointsLabel.text = labPoints + "\n Lab Points";
		messageLabel.text = message;
		gameIcon.image = gameIconUrl;

	};

	api.addEventListener = function(eventName, callback){
		if (eventName=='close') {callbackOnClose = callback;}
	};

	return api;
}());