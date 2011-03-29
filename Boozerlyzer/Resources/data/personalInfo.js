/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing personal settings
 * to and from the database table PersonalInfo 
 */

var minYear = 1910;
var maxYear = 1999;
var monthname = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

var gender =  ['Female', 'Male','Not Set'];
var weight_kg = [ 'Not Set', '35-40 kg', '40-5 kg', '45-50 kg','50-5 kg', '55-60 kg','60-5 kg', '65-70 kg','70-5 kg', '75-80 kg','80-5 kg', '85-90 kg','90-5 kg', '95-100 kg','100-5 kg', '105-110 kg','110-5 kg', '115-120 kg','120-5 kg', '125-130 kg', '130-5 kg', '135-140 kg', '140+ kg'];
var weight_lb = ['Not Set', '80-90 lb', '90-100 lb', '100-110 lb', '110-120 lb','120-130 lb', '130-140 lb','140-150 lb', '150-160 lb','160-170 lb', '170-180 lb','180-190 lb', '190-200 lb','210-210 lb', '220-230 lb','230-240 lb', '240-250 lb','250-260 lb', '260-270 lb','270-280 lb', '280-290 lb', '300+ lb']
var weight_units = ['kg', 'lb'];
var height_m = ['Not Set', '<1.2m','1.3m','1.4m','1.5m','1.6m','1.7m','1.8m','1.9m','2.0m','2.1m'];
var height_ft = ['Not Set', '<4ft','4ft 3in', '4ft 6in','4ft 9','5ft ','5ft 3in','5ft 6in','5ft 9in','6ft ','6ft 3in', '6ft 6in', '6ft 9in'];
var height_units = ['m','ft'];

// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
var personalInfo = (function(){
	
	//create an object which will be our public API
	var api = {};
	
	//maintain a database connection we can use
	var conn = Titanium.Database.open('ybob');
  
	
	api.getData = function (){
		var mostRecentData = [];
		var rows = conn.execute('SELECT max(ID) FROM PERSONALINFO');
		if ((rows !== null) && (rows.isValidRow())) {
			var maxid = rows.field(0);
			rows = conn.execute('SELECT * FROM PERSONALINFO WHERE ID = ' + maxid);
			if ((rows !== null) && (rows.isValidRow())) {
				mostRecentData = {
					Changed: false,
					TimeStamp: parseFloat(rows.fieldByName('TIMESTAMP')),
					BirthMonth: parseInt(rows.fieldByName('BirthMonth')),
					BirthYear: parseInt(rows.fieldByName('BirthYear')),
					Gender: parseInt(rows.fieldByName('Gender')),
					Height: parseInt(rows.fieldByName('Height')),
					HeightUnits: parseInt(rows.fieldByName('HeightUnits')),
					Nickname: rows.fieldByName('Nickname'),
					Weight: parseInt(rows.fieldByName('Weight')),
					WeightUnits: parseInt(rows.fieldByName('WeightUnits'))
				};
				rows.close();
				return mostRecentData;
			}
		}
		//something didn't work
		return false;
	};
	
	api.setData = function (newData){
		Titanium.API.debug('personalInfo setData');
		
		if (newData.Changed){
			var insertstr = 'INSERT INTO PersonalInfo (UpdateTime,BirthMonth,BirthYear,Gender,Height,HeightUnits,Weight,WeightUnits,NickName)';
			insertstr += 'VALUES(?,?,?,?,?,?,?,?,?)';
			var now = new Date().getTime();
			conn.execute(insertstr,now,newData.BirthMonth,newData.BirthYear,newData.Gender,newData.Height,newData.HeightUnits,newData.Weight,newData.WeightUnits,newData.Nickname);
			Titanium.API.debug('PersonalInfo updated, rowsAffected = ' + conn.rowsAffected);
			Titanium.API.debug('PersonalInfo, lastInsertRowId = ' + conn.lastInsertRowId);
			Titanium.App.Properties.setBool('EnteredPersonalData',true);			
		}
	};
	
	api.setDefaults = function (){
		var result = null;
		result = {
			Changed: false,
			Gender: 2,
			Height: 0,
			Weight: 0,
			HeightUnits: 0,
			WeightUnits: 0,
			BirthMonth: 0,
			BirthYear: 0,
			NickName: ''			
		};
		return result;
	};

	return api;
}());
