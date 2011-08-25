<? // submit.php
  require_once ('include_setup.php');
  // take submission - maybe as JSON?
  // decode it
  // save it to the database
  // do some authentication stuff; create an account

  print_rp ($_REQUEST, 'Request is:');

  $data_type = $_REQUEST['data_type'];

  $accepted_types = array('GameScore');

  if (!in_array($data_type, $accepted_types)) {
    finisherror ('Invalid data_type "' . $data_type . '" specified (only currently allows ' . implode(', ', $accepted_types) . ')');
  }

  $data = $_REQUEST['data'];
  $data = stripslashes($data);
  print "data is $data<br>";
  $decoded = json_decode($data);

  print_rp($decoded, 'decoded data:');

  $NewRow = new $data_type($decoded);

  $NewRow->save();

?>
