/**
 * @author Caspar Addyman
 * 
 * Alcohol Standard Drinks (units in uk) are the sizes of a standard drink in 
 * the various countries of the world. Taken from wikipedia.
 * http://en.wikipedia.org/wiki/Standard_drink
 */


	//maintain a database connection we can use
	var conn;
	if (!conn){
		conn = Titanium.Database.install('/ybob.db','ybob');
	}

		
	//get standard drinks either for a single country
	//or for all of them!
	exports.getStrengths = function (DrugName){
		var returnData = [];
		var rows;
		var selectStr = 'SELECT DOSESTRENGTH FROM DrugDoses Where DOSESTRENGTH Is NOT NULL and  DrugName = ?';
		rows =conn.execute(selectStr, DrugName);
		if ((rows !== null) && (rows.isValidRow())) {
			while(rows.isValidRow()){
				returnData.push({
					Drug: DrugName,
					DoseStrength: parseFloat(rows.fieldByName('DoseStrength'))
				});
				rows.next();				
			}
			rows.close();
			return returnData;
		}
		//something didn't work
		return false;
	};
	
	//get standard drinks either for a single country
	//or for all of them!
	exports.getSizes = function (DrugName){
		var returnData = [];
		var rows;
		var selectStr = 'SELECT DOSESIZE, DOSEDESCRIPTION FROM DrugDoses Where DOSESIZE Is NOT NULL and DrugName = ?';
		rows =conn.execute(selectStr, DrugName);
		if ((rows !== null) && (rows.isValidRow())) {
			while(rows.isValidRow()){
				returnData.push({
					Drug: DrugName,
					DoseSize: parseFloat(rows.fieldByName('DoseSize')),
					DoseDescription: rows.fieldByName('DoseDescription')
				});
				rows.next();				
			}
			rows.close();
			return returnData;
		}
		//something didn't work
		return false;
	};	

