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
	
	var subtypes = ['Total', 'Speed', 'Coordination', 'Accuracy','Alcohol'];
	var highicons = ['', 'rocket.png', 'astronaut_256.png', 'Angel.png','beer-full.png'];
	var lowicons = ['', 'snail.png', 'baby_icon.png','Devil.png','beer-empty.png'];
	
	var labelHighScores = Titanium.UI.createLabel({
		text:'High Scores',
		font:{fontSize:42,fontFamily:'sans-serif',fontWeight:'bold'},
		textAlign:'center',
		height:72,
		width:220,
		top:0,
		left:0,
		color:'green',
		zIndex:0,
	});
	win.add(labelHighScores);
	
	
	var highScores = Titanium.UI.createImageView({
		image:'../icons/Evolution.png',
		height:72,
		width:72 * 2.9,  //keep correct proportions
		top:0,
		left:0,
		opacity:0.3
	});

	var high = Ti.UI.createImageView({
		image:'../icons/' + highicons[0],
		height:sizeScoreIcon,
		width:sizeScoreIcon,
		top:topAxis,
		left:0
	})
	win.add(high);
	
	var low = Ti.UI.createImageView({
		image:'../icons/snail.png',
		height:sizeScoreIcon,
		width:sizeScoreIcon,
		top:topAxis+heightAxis-axisInset,
		left:0	
	})
	win.add(low);
	
	var time = Ti.UI.createImageView({
		image:'../icons/time.png',
		height:sizeScoreIcon,
		width:sizeScoreIcon,
		top:200,
		left:200	
	})
	win.add(time);
	

	
	
	var footer = Ti.UI.createView({
		backgroundColor:'#111',
		height:30
	});
	
	var footerLabel = Ti.UI.createLabel({
		font:{fontFamily:'Helvetica Neue',fontSize:14,fontWeight:'normal'},
		text:'Submit to Server',
		color:'#282',
		textAlign:'right',
		left:4,
		width:'auto',
		height:'auto'
	});
	footer.add(footerLabel);
	
	var header = Ti.UI.createView({
		backgroundColor:'#999',
		height:'auto'
	});
	var headerLabel = Ti.UI.createLabel({
		font:{fontFamily:'Helvetica Neue',fontSize:12,fontWeight:'bold'},
		text:'',
		color:'#222',
		textAlign:'center',
		top:0,
		left:4,
		width:'auto',
		height:30
	});
	header.add(headerLabel);
		
	var tv = Ti.UI.createTableView({
		headerView:header,
		footerView:footer,
		rowHeight:28
	});
	
	function populateHighScores(){
		tv.data = null;
		var thisGameHighScores = Ti.App.boozerlyzer.data.gameScores.HighScores('NumberStroop',10);
		
		var len = thisGameHighScores.length;
		
		for(var i=0;i<len:i++){
			
			var row = Ti.UI.createTableViewRow({
		        height: 26,
		        className: 'oneScore'
		    });
		    var labelOneScore = Ti.UI.createLabel({
		    	text:(i+1) + ' - ' + thisGameHighScores.TotalScore,
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
				url: '../app.js',
				title: 'Boozerlyzer',
				backgroundImage: '../images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			})
		}
		win.close();
		Ti.App.boozerlyzer.winHome.open();
	});
})();