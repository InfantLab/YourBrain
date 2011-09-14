<?

if (!$DB_DISABLE) {
  function db_query($sql) {
    return mysql_query($sql);
  }

  function db_fetch_array($resultset) {
    return mysql_fetch_array($resultset);
  }

  function db_fetch_object($resultset) {
    return mysql_fetch_object($resultset);
  }

  function db_num_rows($resultset) {
    return mysql_num_rows($resultset);
  }

  function db_error () {
    return mysql_error();
  }

  function db_connect() {
    global $DBHOST;
    global $DBUSER;
    global $DBPASS;
    global $DBDB;
    $conn = mysql_connect($DBHOST, $DBUSER, $DBPASS);
    mysql_select_db($DBDB);
    return $conn;
  }
} else {
  function db_query($sql) {
    //
    print "db_query($sql) - not actually saved to database\n<br>";
  }
  function db_fetch_object($resultset) {
    //
  }
  function db_num_rows($resultset) {
    //
  } 
  function db_error() {
    //
  }
  function db_connect() {
    return true;
    //
  }
}
