/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing doseage settings
 * to and from the database table DoseageLog 
 */



// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function(){
	

	//create an object which will be our public API
	//Note we need to use an alias of db variable (for some reason that i don't fully understand)
	var dbAlias = Boozerlyzer.db;
	dbAlias.doseageLog = {};
	dbAlias.doseageLog.columnNames = ['ID','DoseDescription','DoseageStart','DoseageChanged','ExitCode','SessionID','Volume','Strength','Volume','StandardUnits','DrugType','TotalUnits','NumDoses'];
	
	//maintain a database connection we can use
	if (!dbAlias.conn){
		dbAlias.conn = Titanium.Database.install('ybob.db','ybob');
	}

	//get data for the maximum row id 
	dbAlias.doseageLog.getLatestData = function (){
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		//have to do count first because max on empty set behaves badly
		var	rows =dbAlias.conn.execute('SELECT max(ID) FROM DoseageLog WHERE SESSIONID = ?', sessionID);
		if (rows !== null && (rows.isValidRow())) {
			var maxid = parseInt(rows.field(0),10);
			rows.close();
			rows =dbAlias.conn.execute('SELECT * FROM DoseageLog WHERE ID = ?', maxid);
			var returnData = fillDataObject(rows);
			rows.close();
			return returnData;
		}
		//something didn't work
		rows.close();
		return null;
	};
	
	dbAlias.doseageLog.setData = function (newData){
		Titanium.API.debug('doseagelog setData');
		Titanium.API.debug('newData - ' + JSON.stringify(newData[0]));
		if (newData[0].Changed){
			if (newData[0].ID > 0){
				//We update an existing row
				var insertstr = 'UPDATE DOSEAGELOG SET DrugVariety= ?, DoseDescription= ?, DoseageStart = ?,DoseageChanged = ?,ExitCode = ?,SessionID = ?,Volume = ?,Strength = ?,StandardUnits = ?,DrugType = ?,TotalUnits = ?,Number = ? ';
				insertstr += 'WHERE ID = ?';
				Titanium.API.debug('update str ' + insertstr);
				Titanium.API.debug('update str variety ' + newData[0].DrugVariety);
				Titanium.API.debug('update str desc' + newData[0].DoseDescription);
				Titanium.API.debug('update str start ' + newData[0].DoseageStart);
				
				dbAlias.conn.execute(insertstr,
							 newData[0].DrugVariety,
							 newData[0].DoseDescription,
							 newData[0].DoseageStart,
							 newData[0].DoseageChanged,
							 newData[0].ExitCode,
							 newData[0].SessionID,
							 newData[0].Volume,
							 newData[0].Strength,
							 newData[0].StandardUnits,
							 newData[0].DrugType,
							 newData[0].TotalUnits,
							 newData[0].NumDoses,
							 newData[0].ID );
			} else {
				//new row
				var insertstr = 'INSERT INTO DOSEAGELOG (DrugVariety, DoseDescription,DoseageStart,DoseageChanged,ExitCode,SessionID,Volume,Strength,StandardUnits,DrugType,TotalUnits,Number)';
				insertstr += 'VALUES(?,?,?, ?,?,?, ?,?,?, ?,?,?)';
				Titanium.API.debug('update str ' + insertstr);
				Titanium.API.debug('update str variety ' + newData[0].DrugVariety);
				Titanium.API.debug('update str desc' + newData[0].DoseDescription);
				Titanium.API.debug('update str start ' + newData[0].DoseageStart);
				dbAlias.conn.execute(insertstr,
							 newData[0].DrugVariety,		//beer/wine/spirits
							 newData[0].DoseDescription,	//pint/sml glass etc
							 newData[0].DoseageStart,		//time opened the drinks log window
							 newData[0].DoseageChanged,		//time we closed it
							 newData[0].ExitCode,			//how did we close it (not used)
							 newData[0].SessionID,			//current session id
							 newData[0].Volume,				//Size of drink in millilitres
							 newData[0].Strength,			//Strength as % abv
							 newData[0].StandardUnits,		//how many standard units (for given country)
							 newData[0].DrugType,			//always 'Alcohol'
							 newData[0].TotalUnits,			//Total millilitres pure alcohol
							 newData[0].NumDoses);			//Number of drinks
			}
			Titanium.API.debug('DoseageLog updated, rowsAffected = ' +dbAlias.conn.rowsAffected);
			Titanium.API.debug('DoseageLog, lastInsertRowId = ' +dbAlias.conn.lastInsertRowId);
		}
	};
	
	dbAlias.doseageLog.newDrink = function (){
		var result = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		var insertstr = 'INSERT INTO DOSEAGELOG (DrugVariety, DoseDescription,DoseageStart,DoseageChanged,ExitCode,SessionID,Volume,Strength,StandardUnits,DrugType,TotalUnits,Number)';
		insertstr += 'VALUES(?,?,?, ?,?,?, ?,?,?, ?,?,?)';
		var now = parseInt((new Date()).getTime()/1000,10);
		dbAlias.conn.execute(insertstr,'NULL','Session Start',now,now,'',sessionID,0,0,0,0,0,0);
		Titanium.API.debug('DoseageLog updated, rowsAffected = ' +dbAlias.conn.rowsAffected);
		Titanium.API.debug('DoseageLog, lastInsertRowId = ' +dbAlias.conn.lastInsertRowId);
		result.push({
			Changed: false,
			DrugVariety:'',
			DoseDescription:'Session Start',
			ID:dbAlias.conn.lastInsertRowId,
			DoseageStart: now,
			DoseageChanged: now,
			ExitCode: '',
			SessionID: sessionID,
			Volume: 0,
			Strength:0,
			StandardUnits: 0,
			DrugType:'Alcohol',
			TotalUnits: 0,
			NumDoses: 0
		});
		return result;
	};
		
	//get all data for this Session ID 
	dbAlias.doseageLog.getAllSessionData = function (sessionID){
		var rows =dbAlias.conn.execute('SELECT * FROM DoseageLog WHERE SESSIONID = ? ORDER BY DoseageChanged ASC', sessionID);
		var returnData = fillDataObject(rows);
		rows.close();
		return returnData;
	};

	/***
	 * return all the relevant rows from a given time range.
	 */
	dbAlias.doseageLog.getTimeRangeData = function (minTime, maxTime){
		var rows
		if (maxTime !== null){
			rows =dbAlias.conn.execute('SELECT * FROM DoseageLog WHERE DoseageChanged > ? and DoseageChanged < ? ORDER BY DoseageChanged ASC', minTime, maxTime);
		}else{
			rows =dbAlias.conn.execute('SELECT * FROM DoseageLog WHERE DoseageChanged > ? ORDER BY DoseageChanged ASC', minTime);
		}
		var returnData = fillDataObject(rows);
		rows.close();
		return returnData;
	};
	
	/***
	 * when passed a starttime and an endtime returns the total
	 * amount of alcohol in ML consumed in that period. 
	 * Grouped by drink type
	 */
	dbAlias.doseageLog.drinksinTimePeriod= function (minTime, maxTime){
		Ti.API.debug("drinksinTimePeriod started");
		var returnData =[];		
		var drink = ['Beer','Wine','Spirits'];
		var rows =dbAlias.conn.execute('SELECT DrugVariety, SUM(totalUnits) as SumUnits from DoseageLog where DrugVariety != "NULL" and DoseageChanged > ? and DoseageChanged < ? GROUP BY DrugVariety', minTime, maxTime);
		while(rows.isValidRow()){
			returnData.push({
				DrugVariety:rows.fieldByName('DrugVariety'),
				TotalUnits:rows.fieldByName('SumUnits')
			});
			rows.next();
		}
		rows.close();
		return returnData;
	};
	
	/***
	 * Return the sum of mls of alcohol in this array of drink data
	 */
	dbAlias.doseageLog.totalDrinkVolume = function (drinkData){
		if (drinkData==null) return 0; // no drink data (ie user hasn't entered any drinks)
		var d = drinkData.length;
		var vol =0;
		for(var i=0;i<d;i++){
			vol += drinkData[i].TotalUnits;
		}
		return vol;
	};
	

	
	/***
	 * copy data from recordset into our own datastructure
	 */
	function fillDataObject(rows){
		if ((rows !== null) && (rows.isValidRow())) {
			var mostRecentData = [];
			while(rows.isValidRow()){
				mostRecentData.push({
					ID:				parseInt(rows.fieldByName('ID'), 10),			
					DrugVariety:	rows.fieldByName('DrugVariety'),				//beer/wine/spirits
					DoseDescription:rows.fieldByName('DoseDescription'),			//pint/sml glass etc
					DoseageStart:	parseInt(rows.fieldByName('DoseageStart'),10),	//time opened the drinks log window
					DoseageChanged:	parseInt(rows.fieldByName('DoseageChanged'),10),//time we closed it
					ExitCode:		rows.fieldByName('ExitCode'),					//how did we close it (not used)
					SessionID:		parseInt(rows.fieldByName('SessionID'),10),		//current session id
					Volume:			parseFloat(rows.fieldByName('Volume')),			//Size of drink in millilitres
					Strength:		parseFloat(rows.fieldByName('Strength')),		//Strength as % abv
					StandardUnits:	parseFloat(rows.fieldByName('StandardUnits')),	//how many standard units (for given country)
					DrugType:		rows.fieldByName('DrugType'),					//always 'Alcohol'
					TotalUnits:		parseFloat(rows.fieldByName('TotalUnits')),		//Total millilitres pure alcohol
					NumDoses:		parseFloat(rows.fieldByName('Number'))			//Number of drinks
				});
				rows.next();				
			}
			rows.close();
			return mostRecentData;
		}
		//something didn't work
		rows.close();
		return null;
	}
}());
