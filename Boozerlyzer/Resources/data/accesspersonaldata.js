/**
 * @author caspar
 * 
 * read personal settings off database 
 */

var db = Titanium.Database.install('../ybob.db','ybob');

var rows = db.execute('SELECT * FROM PERSONALINFO');
//var rows = db.execute('SELECT * FROM TIPS');
//db.execute('UPDATE TIPS SET TITLE="UPDATED TITLE" WHERE TITLE = "FOO"');
//db.execute('INSERT INTO TIPS VALUES("FOO", "BAR")');

//db.execute("COMMIT");
while (rows.isValidRow())
{
	Titanium.API.info(rows.field(1) + '\n' + rows.field(0) + ' col 1 ' + rows.fieldName(0) + ' col 2 ' + rows.fieldName(1));
	rows.next();
}

// close database
rows.close();

var dosestr = 'INSERT INTO DoseageLog (ID, SessionID,SessionStart,DoseageStart, DoseageFinish, ExitCode, Pints,Spirits,Wine)';
dosestr += 'VALUES(?,?,?,?,?,?,?,?,)';


db.execute();


//var db = Titanium.Database.install('../assets/ybob_db','ybob_db');
//
// 
////var dbtoo = Titanium.Database.open('ybob_db');
//
////db.execute('INSERT INTO DATABASETEST (ID, NAME ) VALUES(?,?)',5,'Name 5');
////Titanium.API.info('JUST INSERTED, rowsAffected = ' + db.rowsAffected);
////Titanium.API.info('JUST INSERTED, lastInsertRowId = ' + db.lastInsertRowId);
//
//var rows = db.execute('SELECT * FROM PERSONALINFO');
//Titanium.API.info('ROW COUNT = ' + rows.getRowCount());
//
//while (rows.isValidRow())
//{
//	Titanium.API.info('ID: ' + rows.field(0) + ' NAME: ' + rows.fieldByName('name'));
//	rows.next();
//}
//rows.close();
//db.close();  // close db when you're done to save resources
//
////Ti.UI.currentWindow.addEventListener('click',function(e){Titanium.UI.currentWindow.close();});
////var db = Titanium.Database.install('../testdb.db','quotes');
////
////var rows = db.execute('SELECT * FROM TIPS');
////db.execute('UPDATE TIPS SET TITLE="UPDATED TITLE" WHERE TITLE = "FOO"');
////db.execute('INSERT INTO TIPS VALUES("FOO", "BAR")');
////
//////db.execute("COMMIT");
////while (rows.isValidRow())
////{
////	Titanium.API.info(rows.field(1) + '\n' + rows.field(0) + ' col 1 ' + rows.fieldName(0) + ' col 2 ' + rows.fieldName(1));
////	rows.next();
////}
////
////// close database
////rows.close();
