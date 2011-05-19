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
	Ti.App.boozerlyzer.data.doseageLog = {};
	
	//maintain a database connection we can use
	var conn = Titanium.Database.install('ybob.db','ybob');

  
	//get data for the maximum row id 
	Ti.App.boozerlyzer.data.doseageLog.getLatestData = function (){
		var mostRecentData = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		//have to do count first because max on empty set behaves badly
		var	rows = conn.execute('SELECT max(ID) FROM DoseageLog WHERE SESSIONID = ?', sessionID);
		if (rows !== null && (rows.isValidRow())) {
			var maxid = parseInt(rows.field(0));
			rows.close();
			rows = conn.execute('SELECT * FROM DoseageLog WHERE ID = ?', maxid);
			var returnData = fillDataObject(rows);
			rows.close();
			return returnData;
		}
		//something didn't work
		return false;
	};
	
	Ti.App.boozerlyzer.data.doseageLog.setData = function (newData){
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
				
				conn.execute(insertstr,
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
				conn.execute(insertstr,
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
							 newData[0].NumDoses);
			}
			Titanium.API.debug('DoseageLog updated, rowsAffected = ' + conn.rowsAffected);
			Titanium.API.debug('DoseageLog, lastInsertRowId = ' + conn.lastInsertRowId);
		}
	};
	
	Ti.App.boozerlyzer.data.doseageLog.newDrink = function (){
		var result = [];
		var sessionID = Titanium.App.Properties.getInt('SessionID');
		var insertstr = 'INSERT INTO DOSEAGELOG (DrugVariety, DoseDescription,DoseageStart,DoseageChanged,ExitCode,SessionID,Volume,Strength,StandardUnits,DrugType,TotalUnits,Number)';
		insertstr += 'VALUES(?,?,?, ?,?,?, ?,?,?, ?,?,?)';
		var now = parseInt((new Date()).getTime()/1000);
		conn.execute(insertstr,'NULL','Session Start',now,now,'',sessionID,0,0,0,0,0,0);
		Titanium.API.debug('DoseageLog updated, rowsAffected = ' + conn.rowsAffected);
		Titanium.API.debug('DoseageLog, lastInsertRowId = ' + conn.lastInsertRowId);
		result.push({
			Changed: false,
			DrugVariety:'',
			DoseDescription:'Session Start',
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
	Ti.App.boozerlyzer.data.doseageLog.getAllSessionData = function (sessionID){
		var rows = conn.execute('SELECT * FROM DoseageLog WHERE SESSIONID = ? ORDER BY DoseageChanged ASC', sessionID);
		var returnData = fillDataObject(rows);
		rows.close();
		return returnData;
	};

	/***
	 * return all the relevant rows from a given time range.
	 */
	Ti.App.boozerlyzer.data.doseageLog.getTimeRangeData = function (minTime, maxTime){
		var rows
		if (maxTime !== null){
			rows = conn.execute('SELECT * FROM DoseageLog WHERE DoseageChanged > ? and DoseageChanged < ? ORDER BY DoseageChanged ASC', minTime, maxTime);
		}else{
			rows = conn.execute('SELECT * FROM DoseageLog WHERE DoseageChanged > ? ORDER BY DoseageChanged ASC', sessionID);
		}
		var returnData = fillDataObject(rows);
		rows.close();
		return returnData;
	};

	
	/***
	 * copy data from recordset into our own datastructure
	 */
	function fillDataObject(rows){
		if ((rows !== null) && (rows.isValidRow())) {
			var mostRecentData = [];
			while(rows.isValidRow()){
				mostRecentData.push({
					ID:				parseInt(rows.fieldByName('ID')),
					DrugVariety: 	rows.fieldByName('DrugVariety'),
					DoseDescription:rows.fieldByName('DoseDescription'),
					DoseageStart: 	parseInt(rows.fieldByName('DoseageStart')),
					DoseageChanged: parseInt(rows.fieldByName('DoseageChanged')),
					ExitCode: 		rows.fieldByName('ExitCode'),
					SessionID: 		parseInt(rows.fieldByName('SessionID')),
					Volume: 		parseFloat(rows.fieldByName('Volume')),
					Strength: 		parseFloat(rows.fieldByName('Strength')),
					StandardUnits: 	parseFloat(rows.fieldByName('StandardUnits')),
					DrugType: 		rows.fieldByName('DrugType'),
					TotalUnits: 	parseFloat(rows.fieldByName('TotalUnits')),
					NumDoses: 		parseFloat(rows.fieldByName('Number'))
				});
				rows.next();				
			}
			rows.close();
			return mostRecentData;
		}
		//something didn't work
		return false;
 	};

}());
