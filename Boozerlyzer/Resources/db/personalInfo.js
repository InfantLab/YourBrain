/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing personal settings
 * to and from the database table PersonalInfo 
 */

// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function(){

	//create an object which will be our public API
	//Note we need to use an alias of db variable (for some reason that i don't fully understand)
	var dbAlias = Ti.App.boozerlyzer.db;
	dbAlias.personalInfo = {};
	
	//hardcoded values for the personal info form
	//bad practice I know. will fix it eventually
	dbAlias.personalInfo.minYear = 1910;
	dbAlias.personalInfo.maxYear = 1999;
	dbAlias.personalInfo.minHeight_m = 1.35;
	dbAlias.personalInfo.maxHeight_m = 2.15; 
	dbAlias.personalInfo.stepHeight_m = 0.01;
	dbAlias.personalInfo.minHeight_in = 54;
	dbAlias.personalInfo.maxHeight_in = 84;
	dbAlias.personalInfo.stepHeight_in = 1;
	
	dbAlias.personalInfo.minWeight_kg = 35;
	dbAlias.personalInfo.maxWeight_kg = 155;
	dbAlias.personalInfo.stepWeight_kg = 1;
	dbAlias.personalInfo.minWeight_lb = 70;
	dbAlias.personalInfo.maxWeight_lb = 350;
	dbAlias.personalInfo.stepWeight_lb = 1;
	
	dbAlias.personalInfo.monthname = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	dbAlias.personalInfo.gender =  ['Female', 'Male','Not Set'];
	// dbAlias.personalInfo.weight_kg = [ 'Not Set', '35kg', '40-5 kg', '45-50 kg','50-5 kg', '55-60 kg','60-5 kg', '65-70 kg','70-5 kg', '75-80 kg','80-5 kg', '85-90 kg','90-5 kg', '95-100 kg','100-5 kg', '105-110 kg','110-5 kg', '115-120 kg','120-5 kg', '125-130 kg', '130-5 kg', '135-140 kg', '140+ kg'];
	// dbAlias.personalInfo.weight_lb = ['Not Set', '80 lb', '90-100 lb', '100-110 lb', '110-120 lb','120-130 lb', '130-140 lb','140-150 lb', '150-160 lb','160-170 lb', '170-180 lb','180-190 lb', '190-200 lb','210-210 lb', '220-230 lb','230-240 lb', '240-250 lb','250-260 lb', '260-270 lb','270-280 lb', '280-290 lb', '300+ lb']
	dbAlias.personalInfo.weight_units = ['kg', 'lb'];
	// dbAlias.personalInfo.height_m = ['Not Set', '<1.2m','1.3m',,'1.35m','1.4m',,'1.4m''1.5m','1.6m','1.7m','1.8m','1.9m','2.0m','2.1m'];
	// dbAlias.personalInfo.height_ft = ['Not Set', '<4ft','4ft 3in', '4ft 6in','4ft 9','5ft ','5ft 3in','5ft 6in','5ft 9in','6ft ','6ft 3in', '6ft 6in', '6ft 9in'];
	dbAlias.personalInfo.height_units = ['m','in'];

	
	dbAlias.personalInfo.convertIntoNewUnits = function(value,newUnits){
		var conversionFactor = 1;
		if (newUnits === 'kg'){
			//converting Lb to kg
			conversionFactor = 1/2.2046;
		}else if (newUnits === 'lb'){
			//converting kg to Lb
			conversionFactor = 2.2046;
		}else if (newUnits === 'm'){
			//converting in to m
			conversionFactor = 1/39.370;
		}else if (newUnits === 'in'){
			//converting kg to Lb
			conversionFactor = 39.3700;
		}
		return value*conversionFactor;
	}
	dbAlias.personalInfo.roundToStepSize = function(value,Units){
		Ti.API.debug("roundToStepSize " + value + " in " + Units);
		var stepSize = 1;
		if (Units === 'kg'){
			stepSize = dbAlias.personalInfo.stepWeight_kg;
		}else if (Units === 'lb'){
			stepSize = dbAlias.personalInfo.stepWeight_lb;
		}else if (Units === 'm'){
			stepSize = dbAlias.personalInfo.stepHeight_m;
		}else if (Units === 'in'){
			stepSize = dbAlias.personalInfo.stepHeight_in;
		}
		return stepSize*Math.round(value/stepSize);
	}
	
	//maintain a database connection we can use
	if (!dbAlias.conn){
		dbAlias.conn = Titanium.Database.install('ybob.db','ybob');
	}

	
	dbAlias.personalInfo.getData = function (){
		var mostRecentData = [];
		var rows =dbAlias.conn.execute('SELECT max(ID) FROM PERSONALINFO');
		if ((rows !== null) && (rows.isValidRow())) {
			var maxid = rows.field(0);
			rows.close();
			rows =dbAlias.conn.execute('SELECT * FROM PERSONALINFO WHERE ID = ?', maxid);
			if ((rows !== null) && (rows.isValidRow())) {
				mostRecentData = {
					Changed: false,
					TimeStamp: parseFloat(rows.fieldByName('TIMESTAMP')),
					BirthMonth: parseInt(rows.fieldByName('BirthMonth')),
					BirthYear: parseInt(rows.fieldByName('BirthYear')),
					Gender: parseInt(rows.fieldByName('Gender')),
					Height: parseFloat(rows.fieldByName('Height')),
					// HeightUnits: parseInt(rows.fieldByName('HeightUnits')),
					Nickname: rows.fieldByName('Nickname'),
					Weight: parseFloat(rows.fieldByName('Weight')),
					// WeightUnits: parseInt(rows.fieldByName('WeightUnits')),
					Country: rows.fieldByName('Country')
				};
				rows.close();
				return mostRecentData;
			}
		}
		//something didn't work
		rows.close();
		return dbAlias.personalInfo.setDefaults();
	};
	
	dbAlias.personalInfo.setData = function (newData){
		Titanium.API.debug('personalInfo setData');
		Titanium.API.debug('personalInfo:' + JSON.stringify(newData));
		
		if (newData.Changed){
			var insertstr = 'INSERT INTO PersonalInfo (UpdateTime,BirthMonth,BirthYear,Gender,Height,Weight,NickName, Country)';
			insertstr += 'VALUES(?,?,?,?,?,?,?,?)';
			var now = new Date().getTime();
			dbAlias.conn.execute(insertstr,now,newData.BirthMonth,newData.BirthYear,newData.Gender,newData.Height,newData.Weight,newData.Nickname,newData.Country);
			Titanium.API.debug('PersonalInfo updated, rowsAffected = ' +dbAlias.conn.rowsAffected);
			Titanium.API.debug('PersonalInfo, lastInsertRowId = ' +dbAlias.conn.lastInsertRowId);
			Titanium.App.Properties.setBool('EnteredPersonalData',true);			
		}
	};
	

	dbAlias.personalInfo.setDefaults = function (){
		var result = null;
		result = {
			Changed: false,
			Gender: 2,
			Height: 0,
			Weight: 0,
			// HeightUnits: 0,
			// WeightUnits: 0,
			BirthMonth: 0,
			BirthYear: 0,
			NickName: '',
			Country:'Other'			
		};
		return result;
	};

}());
