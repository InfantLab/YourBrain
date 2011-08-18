/**
 * @author Caspar Addyman
 * 
 * Alcohol Standard Drinks (units in uk) are the sizes of a standard drink in 
 * the various countries of the world. Taken from wikipedia.
 * http://en.wikipedia.org/wiki/Standard_drink
 */


// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function(){
	
	//create an object which will be our public API
	Ti.App.boozerlyzer.db.drugDoses= {};
	
	//maintain a database connection we can use
  	var conn = Titanium.Database.install('ybob.db','ybob');
	
		
	//get standard drinks either for a single country
	//or for all of them!
	Ti.App.boozerlyzer.db.drugDoses.getStrengths = function (DrugName){
		var returnData = [];
		var rows;
		var selectStr = 'SELECT DOSESTRENGTH FROM DrugDoses Where DOSESTRENGTH Is NOT NULL and  DrugName = ?';
		rows = conn.execute(selectStr, DrugName);
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
	Ti.App.boozerlyzer.db.drugDoses.getSizes = function (DrugName){
		var returnData = [];
		var rows;
		var selectStr = 'SELECT DOSESIZE, DOSEDESCRIPTION FROM DrugDoses Where DOSESIZE Is NOT NULL and DrugName = ?';
		rows = conn.execute(selectStr, DrugName);
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
}());
