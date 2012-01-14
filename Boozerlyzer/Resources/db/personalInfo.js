/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing personal settings
 * to and from the database table PersonalInfo 
 */

	var conn;
	//maintain a database connection we can use
	if (!conn){
		conn = Titanium.Database.install('/ybob.db','ybob');
	}

	
	//hardcoded values for the personal info form
	//bad practice I know. will fix it eventually
	exports.minYear = 1910;
	exports.maxYear = 1999;
	exports.minHeight_m = 1.35;
	exports.maxHeight_m = 2.15; 
	exports.stepHeight_m = 0.01;
	exports.minHeight_in = 54;
	exports.maxHeight_in = 84;
	exports.stepHeight_in = 1;
	
	exports.minWeight_kg = 35;
	exports.maxWeight_kg = 155;
	exports.stepWeight_kg = 1;
	exports.minWeight_lb = 70;
	exports.maxWeight_lb = 350;
	exports.stepWeight_lb = 1;
	
	exports.monthname = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	exports.gender =  ['Female', 'Male','Not Set'];
	exports.weight_units = ['kg', 'lb'];
	exports.height_units = ['m','in'];

	
	exports.convertIntoNewUnits = function(value,newUnits){
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
	exports.roundToStepSize = function(value,Units){
		Ti.API.debug("roundToStepSize " + value + " in " + Units);
		var stepSize = 1;
		if (Units === 'kg'){
			stepSize = exports.stepWeight_kg;
		}else if (Units === 'lb'){
			stepSize = exports.stepWeight_lb;
		}else if (Units === 'm'){
			stepSize = exports.stepHeight_m;
		}else if (Units === 'in'){
			stepSize = exports.stepHeight_in;
		}
		return stepSize*Math.round(value/stepSize);
	}
	

	
	exports.getData = function (){
		var mostRecentData = [];
		var rows =conn.execute('SELECT max(ID) FROM PERSONALINFO');
		if ((rows !== null) && (rows.isValidRow())) {
			var maxid = rows.field(0);
			rows.close();
			rows =conn.execute('SELECT * FROM PERSONALINFO WHERE ID = ?', maxid);
			if ((rows !== null) && (rows.isValidRow())) {
				mostRecentData = {
					Changed: false,
					TimeStamp: parseFloat(rows.fieldByName('TIMESTAMP')),
					BirthMonth: parseInt(rows.fieldByName('BirthMonth')),
					BirthYear: parseInt(rows.fieldByName('BirthYear')),
					Gender: parseInt(rows.fieldByName('Gender')),
					Height: parseFloat(rows.fieldByName('Height')),
					Nickname: rows.fieldByName('Nickname'),
					Weight: parseFloat(rows.fieldByName('Weight')),
					Country: rows.fieldByName('Country')
				};
				rows.close();
				return mostRecentData;
			}
		}
		//something didn't work
		rows.close();
		return exports.setDefaults();
	};
	
	exports.setData = function (newData){
		Titanium.API.debug('personalInfo setData');
		Titanium.API.debug('personalInfo:' + JSON.stringify(newData));
		
		if (newData.Changed){
			var insertstr = 'INSERT INTO PersonalInfo (UpdateTime,BirthMonth,BirthYear,Gender,Height,Weight,NickName, Country)';
			insertstr += 'VALUES(?,?,?,?,?,?,?,?)';
			var now = new Date().getTime();
			conn.execute(insertstr,now,newData.BirthMonth,newData.BirthYear,newData.Gender,newData.Height,newData.Weight,newData.Nickname,newData.Country);
			Titanium.API.debug('PersonalInfo updated, rowsAffected = ' +conn.rowsAffected);
			Titanium.API.debug('PersonalInfo, lastInsertRowId = ' +conn.lastInsertRowId);
			Titanium.App.Properties.setBool('EnteredPersonalData',true);			
		}
	};
	

	exports.setDefaults = function (){
		var result = null;
		result = {
			Changed: false,
			Gender: 2,
			Height: 0,
			Weight: 0,
			BirthMonth: 0,
			BirthYear: 0,
			NickName: '',
			Country:'Other'			
		};
		return result;
	};

