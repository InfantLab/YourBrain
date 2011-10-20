/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing happiness & drunkeness
 * to and from the database table SelfAssessment 
 */

// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function(){
	
	//create an object which will be our public API
	//Note we need to use an alias of db variable (for some reason that i don't fully understand)
	var dbAlias = Ti.App.boozerlyzer.db;
	dbAlias.selfAssessment = {};
	
	//maintain a database connection we can use
	if (!dbAlias.conn){
		dbAlias.conn = Titanium.Database.install('ybob.db','ybob');
	}

  
	//get data for the maximum row id 
	dbAlias.selfAssessment.getLatestData = function (sessionID){
		var mostRecentData = [];
		//have to do count first because max on empty set behaves badly
		//and a cast cos sessionID sometimes treated as string
		var sessID = parseInt(sessionID,10);
		Titanium.API.trace('selfAssessment sessID:' + sessID );
		var rows =dbAlias.conn.execute('SELECT count(*) FROM SelfAssessment WHERE SESSIONID = ?', sessID);
		Titanium.API.trace('selfAssessment count executed');
		if (rows !== null && rows.isValidRow() && parseInt(rows.field(0),10) > 0 ){		
			Titanium.API.trace('selfAssessment count > 0');
			rows.close();
			rows =dbAlias.conn.execute('SELECT max(ID) FROM SelfAssessment WHERE SESSIONID = ?', sessID);
			Ti.API.trace('selfAssessment max exectue');
			if (rows !== null && rows.isValidRow()) {
				Ti.API.trace('selfAssessment maxid pre' );
				var maxid = parseInt(rows.field(0),10);
				Ti.API.trace('selfAssessment maxid - ' + maxid);
				rows.close();
				rows =dbAlias.conn.execute('SELECT * FROM SelfAssessment WHERE ID = ?', maxid);
				var returnData = fillDataObject(rows);
				rows.close();
				return returnData;
			}
		}
		//something didn't work
		mostRecentData.push({
			Changed: false,
			SesssionID:sessionID,
			DrunkBlur: -1,
			Drunkeness: -1,
			Energy: -1,
			EnergyBlur: -1,
			Happiness: -1,
			HappyBlur: -1,
			SelfAssessmentStart: -1,
			SelfAssessmentChanged: -1
		});
		return mostRecentData;
	};
	
	dbAlias.selfAssessment.newEmotion = function (insertFlag){
		var result = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID', 0);
		var now = parseInt((new Date()).getTime()/1000,10);
		if (insertFlag){ //then we also insert this blank row into database
			var insertstr = 'INSERT INTO SelfAssessment (SessionID, DrunkBlur,Drunkeness,Energy,EnergyBlur,Happiness,HappyBlur,SelfAssessmentStart,SelfAssessmentChanged)';
			insertstr += 'VALUES(?,?,?,?,?,?,?,?,?)';
			dbAlias.conn.execute(insertstr,sessionID,0,0,50,0,50,0,now,now);
			Titanium.API.debug('SelfAssessment NEW, rowsAffected = ' +dbAlias.conn.rowsAffected);
			Titanium.API.debug('SelfAssessment, lastInsertRowId = ' +dbAlias.conn.lastInsertRowId);
		}
		result.push({
			Changed: false,
			SesssionID:sessionID,
			DrunkBlur: 0,
			Drunkeness: 0,
			Energy: 50,
			EnergyBlur: 0,
			Happiness: 50,
			HappyBlur: 0,
			SelfAssessmentStart: now,
			SelfAssessmentChanged: now
		});
		return result;
	};
	
	dbAlias.selfAssessment.setData = function (newData){
		Titanium.API.debug('selfAssessment setData');		
		if (newData[0].Changed){
			var now = parseInt((new Date()).getTime()/1000);
			var insertstr = 'INSERT INTO SelfAssessment (SessionID, DrunkBlur,Drunkeness,Energy,EnergyBlur,Happiness,HappyBlur,SelfAssessmentStart,SelfAssessmentChanged)';
			insertstr += 'VALUES(?,?,?,?,?,?,?,?,?)';
			dbAlias.conn.execute(insertstr,newData[0].SessionID,newData[0].DrunkBlur,newData[0].Drunkeness,newData[0].Energy,newData[0].EnergyBlur,newData[0].Happiness,newData[0].HappyBlur,newData[0].SelfAssessmentStart,now);
			Titanium.API.debug('selfAssessment updated, rowsAffected = ' +dbAlias.conn.rowsAffected);
			Titanium.API.debug('selfAssessment, lastInsertRowId = ' +dbAlias.conn.lastInsertRowId);
			Titanium.API.debug('selfAssessment, lastInsertRowId = ' + newData[0].SessionID);
		}
	};
	
	
		/***
	 * return all the relevant rows from a given time range.
	 */
	dbAlias.selfAssessment.getTimeRangeData = function (minTime, maxTime){
		var rows;
		if (maxTime !== null){
			rows =dbAlias.conn.execute('SELECT * FROM SelfAssessment WHERE SelfAssessmentChanged > ? and SelfAssessmentChanged < ? ORDER BY SelfAssessmentChanged ASC', minTime, maxTime);
		}else{
			rows =dbAlias.conn.execute('SELECT * FROM DoseageLog WHERE SelfAssessmentChanged > ? ORDER BY SelfAssessmentChanged ASC', minTime);
		}
		var returnData = fillDataObject(rows);
		rows.close();
		return returnData;
	};

	//get all data for this Session ID 
	dbAlias.selfAssessment.getAllSessionData = function (sessionID){
		var mostRecentData = [];
		//cast cos sessionID sometimes treated as string
		var sessID = parseInt(sessionID,10);
		var rows =dbAlias.conn.execute('SELECT * FROM SelfAssessment WHERE SessionID = ? ORDER BY SelfAssessmentChanged ASC', sessID);
		var returnData = fillDataObject(rows);
		rows.close();
		return returnData;
	};	
	
	/***
	 * copy data from recordset into our own datastructure
	 */
	function fillDataObject(rows){
		if ((rows !== null) && (rows.isValidRow())) {
			var returnData = [];
			while(rows.isValidRow()){
				returnData.push({
					SessionID:			parseInt(rows.fieldByName('SessionID'),10),
					DrunkBlur:			parseFloat(rows.fieldByName('DrunkBlur')),
					Drunkeness:			parseInt(rows.fieldByName('Drunkeness'),10),
					Energy:				parseInt(rows.fieldByName('Energy'),10),
					EnergyBlur:			parseFloat(rows.fieldByName('EnergyBlur')),
					Happiness:			parseInt(rows.fieldByName('Happiness'),10),
					HappyBlur:			parseInt(rows.fieldByName('HappyBlur'),10),
					SelfAssessmentStart:parseInt(rows.fieldByName('SelfAssessmentStart'),10),
					SelfAssessmentChanged: parseInt(rows.fieldByName('SelfAssessmentChanged'),10)
				});
				rows.next();				
			}
			rows.close();
			return returnData;	
		}
		//something didn't work
		return false;	
	}

}());
