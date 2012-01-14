/**
 * @author Caspar Addyman
 * 
 * Alcohol Standard Drinks (units in uk) are the sizes of a standard drink in 
 * the various countries of the world. Taken from wikipedia.
 * http://en.wikipedia.org/wiki/Standard_drink
 */


	var conn	
	//maintain a database connection we can use
  	if (!conn){
		conn = Titanium.Database.install('/ybob.db','ybob');
	}

		
	//get standard drinks either for a single country
	//or for all of them!
	exports.get = function (Country){
		var rows, returnData = [];
		var selectStr = 'SELECT * FROM AlcoholStandardDrinks ';
		if (typeof(Country)=="undefined" || Country === null){
			rows =conn.execute(selectStr);	 
		}else {
			selectStr += 'WHERE Country = ?';
			rows =conn.execute(selectStr, Country);
		}
		if ((rows !== null) && (rows.isValidRow())) {
			while(rows.isValidRow()){
				returnData.push({
					Country: rows.fieldByName('Country'),
					GramsPerUnit: parseFloat(rows.fieldByName('GramsPerUnit')),
					MillilitresPerUnit: parseFloat(rows.fieldByName('MillilitresPerUnit'))
				});
				rows.next();				
			}
			rows.close();
			return returnData;
		}
		//something didn't work
		//return some defaults
		rows.close();
		return [{	Country: 'UK',
					GramsPerUnit: 8.7,
					MillilitresPerUnit: 10
				}];
	};
