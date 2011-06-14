<?

function print_rp($var, $message = '') {
  print "\n\n$message: <pre>";
  print_r($var);
  print "</pre>\n\n";
}

function __autoload($classname) {
  include 'object_'.$classname.'.php';
}

function finisherror($message = '') {
  print "Fatal ybod_receiver error: " . htmlspecialchars($message) . "\n\n";
  print_rp (debug_backtrace())."\n\n";
  exit;
  exit;
}

function escape($t) {
  global $DB_DISABLE;
  if (!$DB_DISABLE) {
    return mysql_real_escape_string($t);
  } else {
    return addslashes($t);
  }
}

function getUserID () {
	return 1337; // hardcoded atm
}

?>
