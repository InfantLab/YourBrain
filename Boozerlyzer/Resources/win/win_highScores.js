/**
 * @author Caspar Addyman
 * 
 * The main high scores page.. 
 * eventually showing global & local high-scores
 *
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {

	// The main screen for  results
	var win = Titanium.UI.currentWindow;
	
	//layout variables
	var sizeScoreIcon = 48,	sizeIcons = 66, selectedGameIdx = 0;	
	var subtypes = ['Total', 'Speed', 'Coordination', 'Accuracy','Alcohol'];
	var highicons = ['', 'rocket.png', 'astronaut_256.png', 'Angel.png','beer-full.png'];
	var lowicons = ['', 'snail.png', 'baby_icon.png','Devil.png','beer-empty.png'];
	var gameNames = ['Raccoon Hunt','Memory','Number Stroop', 'Pissonyms', 'Emotional Words', 'We feel fine'];
	var gameTypes = ['StatLearning','Memory','NumberStroop','Pissonyms', 'Emotions', 'WeFeelFine'];
	var choiceImgUrls = ['/icons/teddy_bears.png','/icons/Memory.png','/icons/numberStroop.png','/icons/Ice.png','/icons/emotionalwords.png','/icons/feelings.png'];

	var labelHighScores = Titanium.UI.createLabel({
		text:'High Scores',
		font:{fontSize:36,fontFamily:'sans-serif',fontWeight:'bold'},
		textAlign:'center',
		height:'auto',
		width:'auto',
		top:0,
		color:'green',
		zIndex:0,
	});
	win.add(labelHighScores);
	
	
	var highScores = Titanium.UI.createImageView({
		image:'/icons/Evolution.png',
		height:140,
		width:140*2.9,  //keep correct proportions
		opacity:0.3
	});
	win.add(highScores);

	var high = Ti.UI.createImageView({
		image:'/icons/' + highicons[1],
		height:sizeScoreIcon,
		width:sizeScoreIcon,
		top:0,
		left:0
	})
	win.add(high);
	
	var low = Ti.UI.createImageView({
		image:'/icons/' + lowicons[1],
		height:sizeScoreIcon,
		width:sizeScoreIcon,
		top:200,
		left:0	
	})
	win.add(low);
	
	// var time = Ti.UI.createImageView({
		// image:'/icons/time.png',
		// height:sizeScoreIcon,
		// width:sizeScoreIcon,
		// top:200,
		// left:200	
	// })
	// win.add(time);

	
	var scrollChoices = Ti.UI.createScrollView({
		bottom:4,
		left:60,
		height:sizeIcons,
		width:300,
		contentHeight:'auto',
		contentWidth:'auto',
		showHorizontalScrollIndicator:true,
		showVerticalScrollIndicator:false
	});
	win.add(scrollChoices);
	
	var leftPlace = 0;
	var leftPlaceOriginal = leftPlace;
	
	for(var i =0, iMax=choiceImgUrls.length;i<iMax;i++){
		var imgGame = Ti.UI.createImageView({
			idx:i,
			image:choiceImgUrls[i],
			width:sizeIcons,
			left:leftPlace,
			height:sizeIcons,
			top:0
		});
		imgGame.addEventListener('click',function(ev){
			scrollChoiceClicked(ev)
		});

		scrollChoices.add(imgGame);
		leftPlace += sizeIcons + 10;;
	}
	
	function scrollChoiceClicked(events){
		selectedGameIdx = parseInt(events.source.idx);
		populateHighScores()
	}
	
	
	var footer = Ti.UI.createView({
		backgroundColor:'#111',
		height:30
	});
	
	var footerLabel = Ti.UI.createLabel({
		font:{fontFamily:'Helvetica Neue',fontSize:14,fontWeight:'normal'},
		text:'Submit to Server..',
		color:'#282',
		textAlign:'right',
		width:'auto',
		height:'auto'
	});
	footer.add(footerLabel);
	footer.addEventListener('click',function (){
		alert('submitting high scores');
	});
	
	var header = Ti.UI.createView({
		backgroundColor:'#999',
		height:'auto'
	});
	var headerLabel = Ti.UI.createLabel({
		font:{fontFamily:'Helvetica Neue',fontSize:12,fontWeight:'bold'},
		text:'Number Stroop',
		color:'#222',
		textAlign:'center',
		top:0,
		left:4,
		width:'auto',
		height:30
	});
	header.add(headerLabel);
		
	var tv = Ti.UI.createTableView({
		height:220,
		width:220,
		headerView:header,
		footerView:footer,
		rowHeight:28
	});
	win.add(tv);
	
	function populateHighScores(){
		tv.data = [];
		headerLabel.text = gameNames[selectedGameIdx];
		var thisGameHighScores = Ti.App.boozerlyzer.data.gameScores.HighScores(gameTypes[selectedGameIdx],10);
		
		var len = thisGameHighScores.length;
		
		for(var i=0;i<len;i++){
			
			var row = Ti.UI.createTableViewRow({
		        height: 26,
		        className: 'oneScore'
		    });
		    var labelOneScore = Ti.UI.createLabel({
		    	text:(i+1) + ' - ' + thisGameHighScores[i].TotalScore,
				top:0,
				left:32,
				textAlign:'left',
				color:'white',
				font:{fontSize:14,fontWeight:'bold'}
			});
			row.add(labelOneScore);

			tv.appendRow(row);
		}
	}

	populateHighScores();
	
	
	
	//
	// Cleanup and return home
	win.addEventListener('android:back', function(e) {
		if (Ti.App.boozerlyzer.winHome === undefined 
			 || Ti.App.boozerlyzer.winHome === null) {
			Ti.App.boozerlyzer.winHome = Titanium.UI.createWindow({ modal:true,
				url: '/app.js',
				title: 'Boozerlyzer',
				backgroundImage: '/images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			})
		}
		win.close();
		Ti.App.boozerlyzer.winHome.open();
	});
})();