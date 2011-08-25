<?

require_once('include_setup.php');

$Model = $_REQUEST['Model'];

if (!isset($Model)) finisherror('No Model set.');

//$result = call_user_func(array($Model,'::get_create_table_sql'));
$obj = new $Model ();

$result = $obj->get_create_table_sql();

echo 'done - result is ' . $result . '<br>';

?>
