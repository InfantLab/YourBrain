/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing gameScores -
 * these also get synched with the database.
 */

(function(){
	
	//create an object which will be our public API
	Ti.App.boozerlyzer.data.gameScores = {};
		
	//maintain a database connection we can use
 	var conn = Titanium.Database.install('ybob.db','ybob');
	
	/***
	 * Returns a set of summary statistcs for the games.
	 * number of times played, highscore, last play time stamp,
	 * Lab Rat point accumulated, maybe other stuff. 
	 * Either for a single instance or for all games
	 */
	Ti.App.boozerlyzer.data.gameScores.GamePlaySummary = function (gameNames, userId, greaterthanID){
		//This gets a bit of a mess as we build the query!
		var querystr = 'SELECT * FROM gameScores WHERE ';
		var gamestr = '';
		var userstr = '';
		var idstr = '';
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
		}
		if (gamestr + userstr !== ''){
			querystr += ' AND ' + idstr;
		}else{
			querystr += idstr;
		}
		//querystr += ' ORDER BY gameType'
		var rows = conn.execute(querystr);
		var retdata = fillDataObject(rows);
		rows.close();
		return retdata;
	};
	
	Ti.App.boozerlyzer.data.gameScores.PlayCount = function (gameNames){
		var returnData = [];
		var queryStr;
		Ti.API.debug('gameNames -' + JSON.stringify(gameNames)); 
		if (gameNames.length === 1) {
			//shouldn't have to do this but something seems to go wrong with a group of one.
			queryStr = 'SELECT game, count(*) FROM gameScores where game = ' + gameNames[0]  ;
		}else{
			queryStr = 'SELECT game, count(*) FROM gameScores where game in (' + ArrayToQuotedString(gameNames) + ') group by game' ;
		}

		var rows = conn.execute(queryStr);
		if (rows !== null  && rows.isValidRow() ) {
			while(rows.isValidRow()){
				returnData.push({
					Game: rows.field(0),
					PlayCount: parseInt(rows.field(1))
				});
				rows.next();
			};
			rows.close();
			return returnData;
		}
		//something didn't work
		rows.close();
		return false;
	};

	Ti.App.boozerlyzer.data.gameScores.LastPlayed = function (gameNames){
		var returnData = [];
		var queryStr = 'SELECT game, max(PlayEnd) FROM gameScores where game in (' + ArrayToQuotedString(gameNames) + ') group by game' ;
		var rows = conn.execute(queryStr);
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
	 * @param object [column] - if absent return LabRatPoints
	 * @param object [gameNames] - if absent return grand total
	 */
	Ti.App.boozerlyzer.data.gameScores.TotalPoints = function (column, gameNames){
		var returnData = [];
		var col = 'LabPoints'
		if (column !== null && column !== undefined){
			col = column;
		}
		Ti.API.debug('TotalPoints - col -' + col);
		if (gameNames === null || gameNames === undefined ){
			Ti.API.debug('Total points');
			//TODO - figure out why commented out code doesn't work
			// var queryStr = 'SELECT Total (?) FROM gameScores';
			// var rows = conn.execute(queryStr, col);
			//note having to hard code this for now 
			var queryStr = 'SELECT Total (LabPoints) FROM gameScores';
			var rows = conn.execute(queryStr);
			if (rows !== null && rows.isValidRow() ) {
				while(rows.isValidRow()){
					Ti.API.debug('Total points' + parseInt(rows.field(0)));
					returnData.push({
						Total: parseInt(rows.field(0)),
						Column: col,
						Game: 'All'
					});
					rows.next();
				};
				rows.close();
				return returnData;
			}
		}else{
			var queryStr;
			if (gameNames.length === 1) {
				//shouldn't have to do this but something seems to go wrong with a group of one.
				queryStr = 'SELECT total (?), game FROM gameScores where game = ' + gameNames[0]; 
			}else{
				queryStr = 'SELECT total (?), game FROM gameScores where game in (' + ArrayToQuotedString(gameNames) + ') group by game' ;
			}
			var rows = conn.execute(queryStr, col);
			if (rows !== null && rows.isValidRow() ) {
				while(rows.isValidRow()){
					returnData.push({
						Total: parseInt(rows.field(0)),
						Column: col,
						Game: rows.field(1),
					});
					rows.next();
				};
				rows.close();
				return returnData;
			}
		}		
		//something didn't work
		return false;
	};

	/**
	 * Participant has completed a game, enter their data
	 * @param {Object} scoreData
	 */
	Ti.App.boozerlyzer.data.gameScores.Result = function (scoreData){
		Titanium.API.debug('Game' + JSON.stringify(scoreData));
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		for (var i=0; i<scoreData.length; i++){
			var insertstr = 'INSERT INTO GameScores ';
			insertstr += '(SessionID,Game,GameVersion,PlayStart,PlayEnd,TotalScore,';
			insertstr += 'Speed_GO,Speed_NOGO,Coord_GO,Coord_NOGO,InhibitionScore,MemoryScore, '
			insertstr += 'Level, Feedback,Choices,LabPoints,UserID)  VALUES(?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?)';
			conn.execute(insertstr,sessionID,
								   scoreData[i].Game, 
								   scoreData[i].GameVersion, 
								   scoreData[i].PlayStart,
								   scoreData[i].PlayEnd,
								   scoreData[i].TotalScore, 
								   scoreData[i].Speed_Go, 
								   scoreData[i].Speed_Nogo,
								   scoreData[i].Coord_GO,
								   scoreData[i].Coord_NOGO, 
								   scoreData[i].InhibtionScore, 
								   scoreData[i].MemoryScore,
								   scoreData[i].Level,
								   scoreData[i].Feedback,
								   JSON.stringify(scoreData[i].Choices),
								   scoreData[i].LabPoints,
								   scoreData[i].UserID);
			Titanium.API.debug('gameScores result, rowsAffected = ' + conn.rowsAffected);
			Titanium.API.debug('gameScores result, lastInsertRowId = ' + conn.lastInsertRowId);	
		}
	};
	
	
	Ti.App.boozerlyzer.data.gameScores.HighScores = function (Game, HowMany){
		var returnData = [];
		var selectStr = 'SELECT TotalScore, PlayEnd from GameScores where Game = ? order by totalscore desc Limit 0, ?' ;
		var rows = conn.execute(selectStr, Game, HowMany);
		if (rows !== null  && rows.isValidRow()) {
			while(rows.isValidRow()){
				returnData.push({
					TotalScore: rows.field(0),
					PlayEnd: parseInt(rows.field(1))
				});
				rows.next();
			};
			rows.close();
			return returnData;
		}
		//something didn't work
		return false;

	};
	

	/***
	 * copy data from recordset into our own datastructure
	 */
	function fillDataObject(rows){
		if ((rows !== null) && (rows.isValidRow())) {
			var returnData = [];
			while(rows.isValidRow()){
				// returnData.push({
					// ID: 			parseInt(rows.fieldByName('ID')),
					// Game: 			rows.fieldByName('Game'),
					// GameVersion:	rows.fieldByName('GameVersion'),
					// PlayStart:		parseInt(rows.fieldByName('PlayStart')),
					// PlayEnd:		parseInt(rows.fieldByName('PlayEnd')),
					// TotalScore: 	parseFloat(rows.fieldByName('TotalScore')),
					// Speed_GO:		parseFloat(rows.fieldByName('Speed_GO')),
					// Speed_NOGO:		parseFloat(rows.fieldByName('Speed_NOGO')),
					// Coord_GO:		parseFloat(rows.fieldByName('Coord_GO')),
					// Coord_NOGO: 	parseFloat(rows.fieldByName('Coord_NOGO')),
					// InhibitionScore:parseFloat(rows.fieldByName('InhibitionScore')),
					// Level: 			parseInt(rows.fieldByName('Level')),
					// Feedback:		rows.fieldByName('Feedback'),
					// Choices:		rows.fieldByName('Choices'),
					// MemoryScore:	parseFloat(rows.fieldByName('MemoryScore')),
					// SessionID:		parseInt(rows.fieldByName('SessionID')),
					// UserID:			parseInt(rows.fieldByName('UserID')),
					// LabPoints:		parseFloat(rows.fieldByName('LabPoints')),
				// });
				//row.fieldByNAme returns undefined for null values so reconvert them to avoid problems passing data around
				returnData.push({
					ID: 			parseInt(rows.fieldByName('ID')),
					Game: 			(rows.fieldByName('Game')==='undefined'?null:rows.fieldByName('Game')),
					GameVersion:	(rows.fieldByName('GameVersion')==='undefined'?null:rows.fieldByName('GameVersion')),
					PlayStart:		(rows.fieldByName('PlayStart')==='undefined'?null:parseInt(rows.fieldByName('PlayStart'))),
					PlayEnd:		(rows.fieldByName('PlayEnd')==='undefined'?null:parseInt(rows.fieldByName('PlayEnd'))),
					TotalScore: 	(rows.fieldByName('TotalScore')==='undefined'?null:parseFloat(rows.fieldByName('TotalScore'))),
					Speed_GO:		(rows.fieldByName('Speed_GO')==='undefined'?null:parseFloat(rows.fieldByName('Speed_GO'))),
					Speed_NOGO:		(rows.fieldByName('Speed_NOGO')==='undefined'?null:parseFloat(rows.fieldByName('Speed_NOGO'))),
					Coord_GO:		(rows.fieldByName('Coord_GO')==='undefined'?null:parseFloat(rows.fieldByName('Coord_GO'))),
					Coord_NOGO: 	(rows.fieldByName('Coord_NOGO')==='undefined'?null:parseFloat(rows.fieldByName('Coord_NOGO'))),
					InhibitionScore:(rows.fieldByName('InhibitionScore')==='undefined'?null:parseFloat(rows.fieldByName('InhibitionScore'))),
					Level: 			(rows.fieldByName('Level')==='undefined'?null:parseInt(rows.fieldByName('Level'))),
					Feedback:		(rows.fieldByName('Feedback')==='undefined'?null:rows.fieldByName('Feedback')),
					Choices:		(rows.fieldByName('Choices')==='undefined'?null:rows.fieldByName('Choices')),
					MemoryScore:	(rows.fieldByName('MemoryScore')==='undefined'?null:parseFloat(rows.fieldByName('MemoryScore'))),
					SessionID:		(rows.fieldByName('SessionID')==='undefined'?null:parseInt(rows.fieldByName('SessionID'))),
					UserID:			(rows.fieldByName('UserID')==='undefined'?null:parseInt(rows.fieldByName('UserID'))),
					LabPoints:		(rows.fieldByName('LabPoints')==='undefined'?null:parseFloat(rows.fieldByName('LabPoints'))),
				});
				rows.next();
			};
			rows.close();
			return returnData;	
		}
		//something didn't work
		return false;
	};
	
	/***
	 * helper function turns a 1d array into a quoted stings
	 * from ['Stroop','Memory'] into '"Stroop","Memory"'
	 */
	function ArrayToQuotedString(array){
		return JSON.stringify(array);
	}
	
}());
