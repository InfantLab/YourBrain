<?

function debug ($text) {
  global $debug_file;
  if (!$debug_file) $debug_file = fopen('debug.log','a');
  fwrite ($debug_file, $text . "\n");
}

function print_rp($var, $message = '', $log = true) {
  print "\n\n$message: <pre>";
  print_r($var);
  print "</pre>\n\n";
  if ($log) debug($message . ':' . print_r($var, true));
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
	global $_USERID;
	return $_USERID;
}
function setUserID ($n) {
	global $_USERID;
	$_USERID = $n;
}

?>
