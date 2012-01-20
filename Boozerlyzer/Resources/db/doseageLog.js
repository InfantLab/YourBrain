/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing doseage settings
 * to and from the database table DoseageLog 
 */

	exports.columnNames = ['ID','DoseDescription','DoseageStart','DoseageChanged','ExitCode','SessionID','Volume','Strength','Volume','StandardUnits','DrugType','TotalUnits','NumDoses'];
	
	//maintain a database connection we can use
	var conn;
	if (!conn){
		conn = Titanium.Database.install('/ybob.db','ybob');
	}

	//get data for the maximum row id 
	exports.getLatestData = function (){
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		//have to do count first because max on empty set behaves badly
		var	rows =conn.execute('SELECT max(ID) FROM DoseageLog WHERE SESSIONID = ?', sessionID);
		if (rows !== null && (rows.isValidRow())) {
			var maxid = parseInt(rows.field(0),10);
			rows.close();
			rows =conn.execute('SELECT * FROM DoseageLog WHERE ID = ?', maxid);
			var returnData = fillDataObject(rows);
			rows.close();
			return returnData;
		}
		//something didn't work
		rows.close();
		return null;
	};
	
	exports.setData = function (newData){
		Titanium.API.debug('doseagelog setData');
		Titanium.API.debug('newData - ' + JSON.stringify(newData));
		if (newData.Changed){
			if (newData.ID > 0){
				//We update an existing row
				var insertstr = 'UPDATE DOSEAGELOG SET DrugVariety= ?, DoseDescription= ?, DoseageStart = ?,DoseageChanged = ?,ExitCode = ?,SessionID = ?,Volume = ?,Strength = ?,StandardUnits = ?,DrugType = ?,TotalUnits = ?,Number = ? ';
				insertstr += 'WHERE ID = ?';
				Titanium.API.debug('update str ' + insertstr);
				Titanium.API.debug('update str variety ' + newData.DrugVariety);
				Titanium.API.debug('update str desc' + newData.DoseDescription);
				Titanium.API.debug('update str start ' + newData.DoseageStart);
				
				conn.execute(insertstr,
							 newData.DrugVariety,
							 newData.DoseDescription,
							 newData.DoseageStart,
							 newData.DoseageChanged,
							 newData.ExitCode,
							 newData.SessionID,
							 newData.Volume,
							 newData.Strength,
							 newData.StandardUnits,
							 newData.DrugType,
							 newData.TotalUnits,
							 newData.NumDoses,
							 newData.ID );
			} else {
				//new row
				var insertstr = 'INSERT INTO DOSEAGELOG (DrugVariety, DoseDescription,DoseageStart,DoseageChanged,ExitCode,SessionID,Volume,Strength,StandardUnits,DrugType,TotalUnits,Number)';
				insertstr += 'VALUES(?,?,?, ?,?,?, ?,?,?, ?,?,?)';
				Titanium.API.debug('update str ' + insertstr);
				Titanium.API.debug('update str variety ' + newData.DrugVariety);
				Titanium.API.debug('update str desc' + newData.DoseDescription);
				Titanium.API.debug('update str start ' + newData.DoseageStart);
				conn.execute(insertstr,
							 newData.DrugVariety,		//beer/wine/spirits
							 newData.DoseDescription,	//pint/sml glass etc
							 newData.DoseageStart,		//time opened the drinks log window
							 newData.DoseageChanged,		//time we closed it
							 newData.ExitCode,			//how did we close it (not used)
							 newData.SessionID,			//current session id
							 newData.Volume,				//Size of drink in millilitres
							 newData.Strength,			//Strength as % abv
							 newData.StandardUnits,		//how many standard units (for given country)
							 newData.DrugType,			//always 'Alcohol'
							 newData.TotalUnits,			//Total millilitres pure alcohol
							 newData.NumDoses);			//Number of drinks
			}
			Titanium.API.debug('DoseageLog updated, rowsAffected = ' +conn.rowsAffected);
			Titanium.API.debug('DoseageLog, lastInsertRowId = ' +conn.lastInsertRowId);
		}
	};
	
	exports.newDrink = function (){
		var result = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		var insertstr = 'INSERT INTO DOSEAGELOG (DrugVariety, DoseDescription,DoseageStart,DoseageChanged,ExitCode,SessionID,Volume,Strength,StandardUnits,DrugType,TotalUnits,Number)';
		insertstr += 'VALUES(?,?,?, ?,?,?, ?,?,?, ?,?,?)';
		var now = parseInt((new Date()).getTime()/1000,10);
		conn.execute(insertstr,'NULL','Session Start',now,now,'',sessionID,0,0,0,0,0,0);
		Titanium.API.debug('DoseageLog updated, rowsAffected = ' +conn.rowsAffected);
		Titanium.API.debug('DoseageLog, lastInsertRowId = ' +conn.lastInsertRowId);
		result.push({
			Changed: false,
			DrugVariety:'',
			DoseDescription:'',
			ID:conn.lastInsertRowId,
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
	exports.deleteDrink = function (drinkID){
		Ti.API.debug('deleting drink ID : ' + drinkID);
		conn.execute('delete FROM DoseageLog WHERE ID = ? ', drinkID);
	};
		
	//get all data for this Session ID 
	exports.getAllSessionData = function (sessionID){
		var rows =conn.execute('SELECT * FROM DoseageLog WHERE SESSIONID = ? ORDER BY DoseageChanged ASC', sessionID);
		var returnData = fillDataObject(rows);
		rows.close();
		return returnData;
	};

	/***
	 * return all the relevant rows from a given time range.
	 */
	exports.getTimeRangeData = function (minTime, maxTime){
		var rows
		Ti.API.debug('doseageLog.getTimeRangeData minTime' + minTime );
		Ti.API.debug('doseageLog.getTimeRangeData maxTime' + maxTime );
		if (maxTime === undefined){
			rows =conn.execute('SELECT * FROM DoseageLog WHERE DoseageChanged > ? ORDER BY DoseageChanged ASC', minTime);		
		}else{
			rows =conn.execute('SELECT * FROM DoseageLog WHERE DoseageChanged > ? and DoseageChanged < ? ORDER BY DoseageChanged ASC', minTime, maxTime);
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
	exports.drinksinTimePeriod= function (minTime, maxTime){
		Ti.API.debug("drinksinTimePeriod started");
		var returnData =[];		
		var rows =conn.execute('SELECT DrugVariety, SUM(totalUnits) as SumUnits from DoseageLog where DrugVariety != "NULL" and DoseageChanged > ? and DoseageChanged < ? GROUP BY DrugVariety', minTime, maxTime);
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
	exports.totalDrinkVolume = function (drinkData){
		if (drinkData===null) {return 0;} // no drink data (ie user hasn't entered any drinks)
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
					DoseageStart:	parseInt(rows.fieldByName('DoseageStart'),10),	//time drink was added - used in BAC calculations
					DoseageChanged:	parseInt(rows.fieldByName('DoseageChanged'),10),//time drink was last edited
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
