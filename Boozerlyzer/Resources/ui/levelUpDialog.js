/**
 * @author Caspar Addyman
 * 
 * A modal user interface element for informing users that they have
 * graduated to the next level. Show them their new icon, 
 * 
 * we use the commonJS require approach to wrap up this modul
 * Copyright yourbrainondrugs.net 2011
 */


// var levelUpDialog = (function(){
	var win; //reference to calling window
	var e, callbackOnClose, isControlsCreated = false;
	var containerViewOpenAnimation, containerViewCloseAnimation;
	var coverViewOpenAnimation, coverViewCloseAnimation;
	var containerView, coverView;
	var oldLevel = 0,newLevel=0;
	var congratulationsLabel,labPointsLabel,goodHamsterIcon,trophyIcon,oldLevelLabel,newLevelLabel;
	var messageLabel, oldLevelIcon, rightArrowIcon, newLevelIcon;
	var levels = [0, 50, 100,200, 500, 1000, 1500,2000,3000,4000, 5000, 10000, 15000, 20000];
	var levelImgs = ['/icons/Potato_Soup-icon.png', '/icons/virus_256.png','/icons/escherichia_coli1.jpg','/icons/beer-full.png','/icons/c-elegans_esa.jpg','/icons/normal.gif', '/icons/zebrafish.jpg','/icons/Mouse.jpg', '/icons/pigeon.jpg','/icons/rat.jpg','/icons/Pavlovs_dog.jpg','/icons/chimpanzee.jpg','/icons/caspar_nirs.png','/icons/android.jpg'];
	var levelLabels =['Primordial Soup','Virus','E.coli', 'Yeast','C.Elegans','Fruit Fly','Zebra Fish','Mouse','Pigeon','Rat',"Pavlov's Dog","Chimpanzee","Homo Sapiens","Cyborg"];
	var wikiBaseUrl = 'http://en.wikipedia.org/wiki/';
	var wikiLevelItem = ['Stanley_Miller','Tobacco_mosaic_virus', 'E.Coli','Yeast', 'Caenorhabditis_elegans','Drosophila_melanogaster','Zebra_Fish','Laboratory_mice#Laboratory_mice','Pigeon_intelligence','Laboratory_rat','Ivan_Pavlov','Chimapanzee','Homo_Sapiens', 'Cyborg'];
	var imgSizeSmall = 56, imgSizeLarge = 78;
	
	function createControls(){
		if (isControlsCreated) {return;}
		Ti.API.debug('levelUpDialog - createControls');

		coverViewOpenAnimation = Ti.UI.createAnimation({opacity:0.8});
		coverViewCloseAnimation = Ti.UI.createAnimation({opacity:0});
		containerViewOpenAnimation = Ti.UI.createAnimation({bottom:0});
		containerViewCloseAnimation = Ti.UI.createAnimation({bottom:-251});

		containerView = Ti.UI.createView({ 
			top:10,
			left:10,
			height:290,
			width:460,
			zIndex:9
		});
		containerView.addEventListener('click', function(){
			//e.cancel = true;
			exports.close();
		});		
		
		coverView = Ti.UI.createView({
			top:10,
			left:10,
			height:290,
			width:460,
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

		// game results
		congratulationsLabel = Ti.UI.createLabel({
			top:4,
			width:'auto',
			text:'Congratulations',
			font:{fontSize:28,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'#FFD700'
		});
		labPointsLabel = Ti.UI.createLabel({
			top:92,
			width:'auto',
			text:'Score    -   00000 points',
			font:{fontSize:24,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'#191'
		});
		messageLabel = Ti.UI.createLabel({
			top:46,
			width:'auto',
			text:"You're moving up in the world",
			font:{fontSize:16,fontFamily:'Helvetic Neue',fontWeight:'italic'},
			textAlign:'center',
			color:'#119'		
		});
		goodHamsterIcon = Ti.UI.createImageView({
			top:'4%',
			left:'4%',
			image:'/icons/hamsterwheel.png',
			height:imgSizeSmall,
			width:imgSizeSmall
		});
		trophyIcon = Ti.UI.createImageView({
			top:'4%',
			right:'2%',
			image:'/icons/Trophy_Gold_256.png',
			height:imgSizeSmall,
			width:imgSizeSmall
		});		
		oldLevelIcon = Ti.UI.createImageView({
			bottom:'25%',
			left:'20%',
			image:'/icons/hamsterwheel.png',
			height:imgSizeSmall,
			width:imgSizeSmall
		});
		oldLevelLabel = Ti.UI.createLabel({
			bottom:'8%',
			left:'15%',
			width:'auto',
			text:'Old Level',
			font:{fontSize:18,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'cyan'
		});
		oldLevelLabel.addEventListener('click', function(){
			Titanium.Platform.openURL(wikiBaseUrl[oldLevel] + wikiLevelItem[oldLevel]);
		});
		rightArrowIcon = Ti.UI.createImageView({
			bottom:'30%',
			left:'44%',
			image:'/icons/rightArrow.png',
			height:imgSizeSmall,
			width:imgSizeSmall
		});
		newLevelIcon = Ti.UI.createImageView({
			bottom:'20%',
			right:'15%',
			image:'/icons/hamsterwheel.png',
			height:imgSizeLarge,
			width:imgSizeLarge
		});
		newLevelLabel = Ti.UI.createLabel({
			bottom:'8%',
			right:'15%',
			width:'auto',
			text:'New level',
			font:{fontSize:18,fontFamily:'Marker Felt',fontWeight:'bold'},
			textAlign:'center',
			color:'cyan'
		});
		newLevelLabel.addEventListener('click', function(){
			Titanium.Platform.openURL(wikiBaseUrl[newLevel] + wikiLevelItem[newLevel]);
		});
		containerView.add(congratulationsLabel);
		containerView.add(messageLabel);
		containerView.add(goodHamsterIcon);
		containerView.add(trophyIcon);
		containerView.add(labPointsLabel);
		containerView.add(oldLevelLabel);
		containerView.add(newLevelLabel);
		containerView.add(oldLevelIcon);
		containerView.add(rightArrowIcon);
		containerView.add(newLevelIcon);
		win.add(containerView);		
		
		isControlsCreated = true;
	}

	/**
	 * Public exports
	 */
	exports.setParent = function (window){
		win = window;
	};
	exports.open = function(){	
		//alert('leveled up');
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

	function getLevel(labPoints){
		var l = 0;
		while(levels[l]<labPoints){l++;}
		return l-1;
	}
	
	exports.getLevelImg = function(labPoints){
		return levelImgs[getLevel(labPoints)];
	};
	/***
	 * woo hoo, you're helping science
	 * 
	 */
	exports.levelUp = function(labPoints){
		newLevel =getLevel(labPoints);
		oldLevel =newLevel -1;
		Ti.API.debug('levelUp set next level' +levels[newLevel+1] );
		Ti.App.Properties.setInt('NextLevel',levels[newLevel+1]);
		createControls();
		labPointsLabel.text = "Lab Points:      " + Math.round(labPoints) + " points";
		//messageLabel.text = message;
		oldLevelIcon.image = levelImgs[oldLevel];
		newLevelIcon.image = levelImgs[newLevel];
		oldLevelLabel.text = levelLabels[oldLevel];
		newLevelLabel.text = levelLabels[newLevel];
	};

	exports.addEventListener = function(eventName, callback){
		if (eventName=='close') {callbackOnClose = callback;}
	};

	// return exports;
// }());