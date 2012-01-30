/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing gameScores -
 * these also get synched with the database.
 */

	
	var conn;
	//maintain a database connection we can use
	if (!conn){
		conn = Titanium.Database.install('/ybob.db','ybob');
	}
	
	/***
	 * Returns a set of summary statistcs for the games.
	 * number of times played, highscore, last play time stamp,
	 * Lab Rat point accumulated, maybe other stuff. 
	 * Either for a single instance or for all games
	 */
	exports.GamePlaySummary = function (gameNames, userId, greaterthanID, byColumns){
		//This gets a bit of a mess as we build the query!
		var querystr = 'SELECT * FROM gameScores WHERE ';
		var gamestr = '', userstr = '', idstr = '', rowcount=0;
		if (gameNames !== null){
			gamestr = ' Game in (' + ArrayToQuotedString(gameNames) +')';
		}
		if (userId !== null){
			userstr = ' UserID = ' + userId;
		}
		if (gameNames !== null && userId !== null){
			querystr += gamestr + ' AND ' + userstr;
		}else{
			querystr += gamestr + userstr;
		}
		if (greaterthanID !== null){
			idstr = ' ID > ' + greaterthanID;
		}else{
			idstr = ' 1';
		}
		
		if (gamestr + userstr !== ''){
			querystr += ' AND ' + idstr;
		}else{
			querystr += idstr;
		}
		querystr += ' ORDER BY ID';
		//alert('got query string ' + querystr);
		var rows =conn.execute(querystr);
		var retdata;
		if (byColumns){
			retdata	= fillByColumns(rows);
		}else{
			retdata = fillDataObject(rows);
		}
		//alert('got retdata of length ' + retdata);
		rows.close();
		return retdata;
	};
	
	/***
	 * Returns a set of summary statistcs for the games.
	 * but wrapped in the format that the webserver likes to see.
	 * see
	 * http://yourbrainondrugs.net/boozerlyzer/submit.php
	 */
	exports.GamePlaySummaryforWebserver = function (gameNames, userId, greaterthanID){
		var retdata = exports.GamePlaySummary(gameNames, userId, greaterthanID);
		Ti.API.debug('webformatted string - ' + retdata);
		return exports.LabelRows(retdata);
	};
	
	/**
	 * Create a new data object labelling each row of data with an id
	 * This is the format the webserver requires the data to be passed in. 
	*/
	exports.LabelRows = function (scoreData){
		Ti.API.debug('db.gameScores.LabelRows num rows' + scoreData.length );
		if (!Ti.App.Properties.getBool('Registered')){
			alert('Please click on the Safe and register or login with Boozerlyzer.net');
			return;
		}
		var UUID = Ti.App.Properties.getString('UUID');
		var jsonout = "{",rowcount = 0, retdata = [];
		for(var row in scoreData){
			//r = (rowcount++).toString();
			//this line is a bit of mess to get right format
			// if (scoreData[row].data_type === "GameScore"){
				var thisrow =  '"'+ (rowcount++) + '":{ "data_type":"GameScore","data":' + JSON.stringify(scoreData[row]) +'},'; 
				Ti.API.debug('scoreData[row] ' + thisrow);
				jsonout += thisrow;			
			// }
		}
		//remove the final comma and add a final bracket
		return JSON.parse(jsonout.substring(0, jsonout.length-1) + '}');
		  
	};
	
	exports.PlayCount = function (gameNames){
		var returnData = [];
		var queryStr;
		Ti.API.debug('gameNames -' + JSON.stringify(gameNames)); 
		if (gameNames.length === 1) {
			//shouldn't have to do this but something seems to go wrong with a group of one.
			queryStr = 'SELECT game, count(*) FROM gameScores where game = ' + gameNames[0]  ;
		}else{
			queryStr = 'SELECT game, count(*) FROM gameScores where game in (' + ArrayToQuotedString(gameNames) + ') group by game' ;
		}

		var rows =conn.execute(queryStr);
		if (rows !== null  && rows.isValidRow() ) {
			while(rows.isValidRow()){
				returnData.push({
					Game: rows.field(0),
					PlayCount: parseInt(rows.field(1))
				});
				rows.next();
			}
			rows.close();
			return returnData;
		}
		//something didn't work
		rows.close();
		return false;
	};

	exports.LastPlayed = function (gameNames){
		var returnData = [];
		var queryStr = 'SELECT game, max(PlayEnd) FROM gameScores where game in (' + ArrayToQuotedString(gameNames) + ') group by game' ;
		var rows =conn.execute(queryStr);
		if (rows !== null && rows.isValidRow() ) {
			while(rows.isValidRow()){
				returnData.push({
					Game: rows.field(0),
					LastPlayed: parseInt(rows.field(1))
				});
				rows.next();
			};
			rows.close();
			return returnData;
		}
		rows.close();
		//something didn't work
		return false;
	};

	/***
	 * return the total points accumulated so far 
	 * @param object [column] - if absent return Lab Points
	 * @param object [gameNames] - if absent return grand total
	 */
	exports.TotalPoints = function (column, gameNames){
		var returnData = [];
		var rows, queryStr;
		var col = 'LabPoints';
		if (column !== null && column !== undefined){
			col = column;
		}
		Ti.API.debug('TotalPoints - col -' + col);
		if (gameNames === null || gameNames === undefined ){
			Ti.API.debug('Total points');
			//TODO - figure out why commented out code doesn't work
			// var queryStr = 'SELECT Total (?) FROM gameScores';
			// var rows =conn.execute(queryStr, col);
			//note having to hard code this for now 
			queryStr = 'SELECT Total (LabPoints) FROM gameScores';
			rows =conn.execute(queryStr);
			if (rows !== null && rows.isValidRow() ) {
				while(rows.isValidRow()){
					Ti.API.debug('Total points' + parseInt(rows.field(0),10));
					returnData.push({
						Total: parseInt(rows.field(0),10),
						Column: col,
						Game: 'All'
					});
					rows.next();
				}
				rows.close();
				return returnData;
			}
		}else{
			if (gameNames.length === 1) {
				//shouldn't have to do this but something seems to go wrong with a group of one.
				queryStr = 'SELECT total (?), game FROM gameScores where game = ' + gameNames[0];
			}else{
				queryStr = 'SELECT total (?), game FROM gameScores where game in (' + ArrayToQuotedString(gameNames) + ') group by game' ;
			}
			rows =conn.execute(queryStr, col);
			if (rows !== null && rows.isValidRow() ) {
				while(rows.isValidRow()){
					returnData.push({
						Total: parseInt(rows.field(0),10),
						Column: col,
						Game: rows.field(1)
					});
					rows.next();
				}
				rows.close();
				return returnData;
			}
		}		
		//something didn't work
		rows.close();
		return false;
	};

    exports.setupStartSequence = function () {
		var LastSentID = Titanium.App.Properties.getInt('LastSentID',0);
		
		var checkHighestSQL = 'select MAX(ID) as maxID FROM GameScores';
		// do database
		var rows = conn.execute(checkHighestSQL);
		if (rows.isValidRow()) {
			var checked_highest = rows.field(0);
		
			if (LastSentID>checked_highest) {
				// first insert should be LastSentID+1
				Ti.API.debug('got next StartInsertID ' + (LastSentID+1));
				Titanium.App.Properties.setInt('StartInsertID', LastSentID+1);
				//conn.execute('update sqlite_sequence SET seq=' + (LastSentID+1) +' WHERE name="GameScores"');
			} else {
				Titanium.App.Properties.setInt('StartInsertID', 0);
			}
		} else {
			Titanium.App.Properties.setInt('StartInsertID',0);
		}
		rows.close();
	};

	/**
	 * Participant has completed a game, enter their data
	 * @param {Object} scoreData
	 */
	exports.SaveResult = function (scoreData){
		Titanium.API.debug('Game' + JSON.stringify(scoreData));
		
		//No matter what data we are given we will add the current booze and emotions..	
		//Easier to do it here than in each individual call to SaveResult
		var now = parseInt((new Date()).getTime()/1000,10);
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		//load up the drink data so we can work out current blood alcohol
		var dataObject = require('/db/dataObject');
		var dbDoseageLog = require('/db/doseageLog');
		var BAC = require('/analysis/bloodalcohol');
		var allDrinks = dataObject.getAllDrinks();
		var personalInfo = dataObject.getPersonalInfo();
		var currentEmotions = dataObject.getCurrentEmotions();
		var drinkVolume_ml = dbDoseageLog.totalDrinkVolume(allDrinks); 
		var currentBloodAlcohol = BAC.calculate(now, allDrinks,personalInfo);

		exports.setupStartSequence();
		
		for (var i=0; i<scoreData.length; i++){
			var insertstr = 'INSERT INTO GameScores ';
			insertstr += '(SessionID,Game,GameVersion,PlayStart,PlayEnd,TotalScore,GameSteps,';
			insertstr += 'Speed_GO,Speed_NOGO,Coord_GO,Coord_NOGO,InhibitionScore,MemoryScore, ';
			insertstr += 'Level, Feedback,Choices,LabPoints,UserID,Alcohol_ml,BloodAlcoholConc,Happiness,Energy,Drunkeness)';
			insertstr += 'VALUES(?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?)';
			conn.execute(insertstr,
								   sessionID,
								   scoreData[i].Game, 
								   scoreData[i].GameVersion, 
								   scoreData[i].PlayStart,
								   scoreData[i].PlayEnd,
								   scoreData[i].TotalScore, 
								   scoreData[i].GameSteps, 
								   
								   scoreData[i].Speed_GO, 
								   scoreData[i].Speed_Nogo,
								   scoreData[i].Coord_GO,
								   scoreData[i].Coord_NOGO, 
								   scoreData[i].InhibtionScore, 

								   scoreData[i].MemoryScore,
								   scoreData[i].Level,
								   scoreData[i].Feedback,
								   JSON.stringify(scoreData[i].Choices),
								   scoreData[i].LabPoints,
								   scoreData[i].UserID,
								   
								   drinkVolume_ml,
								   currentBloodAlcohol,
								   currentEmotions[0].Happiness,
								   currentEmotions[0].Energy,
								   currentEmotions[0].Drunkeness );
			Titanium.API.debug('gameScores result, rowsAffected = ' +conn.rowsAffected);
			Titanium.API.debug('gameScores result, lastInsertRowId = ' +conn.lastInsertRowId);	
			
			///dirty hack to set the primary key to that which is expected next by the server
			if (Titanium.App.Properties.getInt('StartInsertID')>0) {
				conn.execute('update GameScores SET ID=' + Titanium.App.Properties.getInt('StartInsertID') 
				  + ' WHERE ID=' + conn.lastInsertRowId
				);
				Titanium.App.Properties.setInt('StartInsertID', -1);
			}
		}
	};
	
	
	exports.HighScores = function (Game, HowMany){
		var returnData = [];
		var selectStr = 'SELECT TotalScore, PlayEnd from GameScores where Game = ? order by totalscore desc Limit 0, ?' ;
		var rows =conn.execute(selectStr, Game, HowMany);
		if (rows !== null  && rows.isValidRow()) {
			while(rows.isValidRow()){
				returnData.push({
					TotalScore: rows.field(0),
					PlayEnd: parseInt(rows.field(1),10)
				});
				rows.next();
			}
			rows.close();
			return returnData;
		}
		//something didn't work
		rows.close();
		return false;

	};
	

	/***
	 * copy data from recordset into our own datastructure
	 */
	function fillDataObject(rows){
		if ((rows !== null) && (rows.isValidRow())) {
			var returnData = [];
			while(rows.isValidRow()){
			returnData.push({
					GameScoreID:	parseInt(rows.fieldByName('ID'),10), // Local 'ID' field becomes 'GameScoreID' on remote system
					Game:			(rows.fieldByName('Game')==='undefined'?null:rows.fieldByName('Game')),
					GameVersion:	(rows.fieldByName('GameVersion')==='undefined'?null:rows.fieldByName('GameVersion')),
					PlayStart:		(rows.fieldByName('PlayStart')==='undefined'?null:parseInt(rows.fieldByName('PlayStart'),10)),
					PlayEnd:		(rows.fieldByName('PlayEnd')==='undefined'?null:parseInt(rows.fieldByName('PlayEnd'),10)),
					TotalScore:		(rows.fieldByName('TotalScore')==='undefined'?null:parseFloat(rows.fieldByName('TotalScore'))),
					GameSteps:		(rows.fieldByName('GameSteps')==='undefined'?null:parseFloat(rows.fieldByName('GameSteps'))),
					Speed_GO:		(rows.fieldByName('Speed_GO')==='undefined'?null:parseFloat(rows.fieldByName('Speed_GO'))),
					Speed_NOGO:		(rows.fieldByName('Speed_NOGO')==='undefined'?null:parseFloat(rows.fieldByName('Speed_NOGO'))),
					Coord_GO:		(rows.fieldByName('Coord_GO')==='undefined'?null:parseFloat(rows.fieldByName('Coord_GO'))),
					Coord_NOGO:		(rows.fieldByName('Coord_NOGO')==='undefined'?null:parseFloat(rows.fieldByName('Coord_NOGO'))),
					InhibitionScore:(rows.fieldByName('InhibitionScore')==='undefined'?null:parseFloat(rows.fieldByName('InhibitionScore'))),
					Level:			(rows.fieldByName('Level')==='undefined'?null:parseInt(rows.fieldByName('Level'),10)),
					Feedback:		(rows.fieldByName('Feedback')==='undefined'?null:rows.fieldByName('Feedback')),
					Choices:		(rows.fieldByName('Choices')==='undefined'?null:rows.fieldByName('Choices')),
					MemoryScore:	(rows.fieldByName('MemoryScore')==='undefined'?null:parseFloat(rows.fieldByName('MemoryScore'))),
					SessionID:		(rows.fieldByName('SessionID')==='undefined'?null:parseInt(rows.fieldByName('SessionID'),10)),
					UserID:			(rows.fieldByName('UserID')==='undefined'?null:parseInt(rows.fieldByName('UserID'),10)),
					LabPoints:		(rows.fieldByName('LabPoints')==='undefined'?null:parseFloat(rows.fieldByName('LabPoints'))),
					Alcohol_ml:		(rows.fieldByName('Alcohol_ml')==='undefined'?null:parseFloat(rows.fieldByName('Alcohol_ml'))),
					BloodAlcoholConc:(rows.fieldByName('BloodAlcoholConc')==='undefined'?null:parseFloat(rows.fieldByName('BloodAlcoholConc'))),
					Happiness:		(rows.fieldByName('Happiness')==='undefined'?null:parseFloat(rows.fieldByName('Happiness'))),
					Energy:			(rows.fieldByName('Energy')==='undefined'?null:parseFloat(rows.fieldByName('Energy'))),
					Drunkeness:		(rows.fieldByName('Drunkeness')==='undefined'?null:parseFloat(rows.fieldByName('Drunkeness')))
				});
				rows.next();
			}
			rows.close();
			return returnData;	
		}
		//something didn't work
		return false;
	}
	//storing data in columns is more useful for anlysis
	function fillByColumns(rows){
		if ((rows !== null) && (rows.isValidRow())) {
			var returnData = {
					GameScoreID:[],
					Game:[],
					GameVersion:[],
					PlayStart:[],
					PlayEnd:[],
					TotalScore:[],
					GameSteps:[],
					Speed_GO:[],
					Speed_NOGO:[],
					Coord_GO:[],
					Coord_NOGO:[],
					InhibitionScore:[],
					Level:[],
					Feedback:[],
					Choices:[],
					MemoryScore:[],
					SessionID:[],
					UserID:[],
					LabPoints:[],
					Alcohol_ml:[],
					BloodAlcoholConc:[],
					Happiness:[],
					Energy:[],
					Drunkeness:[]
				};
			while(rows.isValidRow()){
				returnData.GameScoreID.push(	parseInt(rows.fieldByName('ID'),10));// Local 'ID' field becomes 'GameScoreID' on remote system
				returnData.Game.push(			rows.fieldByName('Game')==='undefined'?null:rows.fieldByName('Game'));
				returnData.GameVersion.push(	rows.fieldByName('GameVersion')==='undefined'?null:rows.fieldByName('GameVersion'));
				returnData.PlayStart.push(		rows.fieldByName('PlayStart')==='undefined'?null:parseInt(rows.fieldByName('PlayStart'),10));
				returnData.PlayEnd.push(		rows.fieldByName('PlayEnd')==='undefined'?null:parseInt(rows.fieldByName('PlayEnd'),10));
				returnData.TotalScore.push(	rows.fieldByName('TotalScore')==='undefined'?null:parseFloat(rows.fieldByName('TotalScore')));
				returnData.GameSteps.push(		rows.fieldByName('GameSteps')==='undefined'?null:parseFloat(rows.fieldByName('GameSteps')));
				returnData.Speed_GO.push(		rows.fieldByName('Speed_GO')==='undefined'?null:parseFloat(rows.fieldByName('Speed_GO')));
				returnData.Speed_NOGO.push(	rows.fieldByName('Speed_NOGO')==='undefined'?null:parseFloat(rows.fieldByName('Speed_NOGO')));
				returnData.Coord_GO.push(		rows.fieldByName('Coord_GO')==='undefined'?null:parseFloat(rows.fieldByName('Coord_GO')));
				returnData.Coord_NOGO.push(	rows.fieldByName('Coord_NOGO')==='undefined'?null:parseFloat(rows.fieldByName('Coord_NOGO')));
				returnData.InhibitionScore.push(rows.fieldByName('InhibitionScore')==='undefined'?null:parseFloat(rows.fieldByName('InhibitionScore')));
				returnData.Level.push(			rows.fieldByName('Level')==='undefined'?null:parseInt(rows.fieldByName('Level'),10));
				returnData.Feedback.push(		rows.fieldByName('Feedback')==='undefined'?null:rows.fieldByName('Feedback'));
				returnData.Choices.push(		rows.fieldByName('Choices')==='undefined'?null:rows.fieldByName('Choices'));
				returnData.MemoryScore.push(	rows.fieldByName('MemoryScore')==='undefined'?null:parseFloat(rows.fieldByName('MemoryScore')));
				returnData.SessionID.push(		rows.fieldByName('SessionID')==='undefined'?null:parseInt(rows.fieldByName('SessionID'),10));
				returnData.UserID.push(		rows.fieldByName('UserID')==='undefined'?null:parseInt(rows.fieldByName('UserID'),10));
				returnData.LabPoints.push(		rows.fieldByName('LabPoints')==='undefined'?null:parseFloat(rows.fieldByName('LabPoints')));
				returnData.Alcohol_ml.push(	rows.fieldByName('Alcohol_ml')==='undefined'?null:parseFloat(rows.fieldByName('Alcohol_ml')));
				returnData.BloodAlcoholConc.push(rows.fieldByName('BloodAlcoholConc')==='undefined'?null:parseFloat(rows.fieldByName('BloodAlcoholConc')));
				returnData.Happiness.push(	rows.fieldByName('Happiness')==='undefined'?null:parseFloat(rows.fieldByName('Happiness')));
				returnData.Energy.push(		rows.fieldByName('Energy')==='undefined'?null:parseFloat(rows.fieldByName('Energy')));
				returnData.Drunkeness.push(	rows.fieldByName('Drunkeness')==='undefined'?null:parseFloat(rows.fieldByName('Drunkeness')));
		
				rows.next();
			}
			rows.close();
			return returnData;	
		}
		//something didn't work
		return false;
	}
	
	/***
	 * helper function turns a 1d array into a quoted stings
	 * from ['Stroop','Memory'] into '"Stroop","Memory"'
	 */
	function ArrayToQuotedString(array){
		return JSON.stringify(array);
	}
	