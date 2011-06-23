<? //submit_data.php
  require_once('include_setup.php');

  // some debug info
  print_rp($_REQUEST, 'Request is:', true);

  $accepted_types = array('GameScore'); // which row types to accept for entry to the database

  // get the authorisation credentials
  $UserID = $_REQUEST['UserID'];
  $AuthToken = $_REQUEST['AuthToken'];
  // if we weren't just a simple test app, we should check those against our database and do something appropriate if they're not correct.

  setUserID ($UserID);

  // get the version that the client claims to be.  enables us to handle old buggy clients and catch silly errors during development.
  $ClientVersion = $_REQUEST['ClientVersion'];
  $ProtocolVersion = $_REQUEST['ProtocolVersion'];
  // if we weren't just a simple test app, we should take these things into account and maybe change our behaviour depending on what the client is expecting.  
  // for example, we might need to rescale or reformat values, or map to new column names, or just tell the client that they're out of date and can't submit any more.

  ?><hr><?

  // take POST request, get authentication details and data
  $data = stripslashes($_REQUEST['data']); // the data as a JSON string.
  print_rp ($data, 'got data:', true);
  $decoded = json_decode($data); // the data as a tree of associative arrays

  print_rp ($decoded, 'Got decoded JSON data:', true);
  ?><hr><?

  $RowsToSave = array ();

  foreach ($decoded as $key => $data) {
	if (in_array($data->data_type, $accepted_types))
  	  $RowsToSave[] = new $data->data_type ( $data->data );
  }

  foreach ($RowsToSave as $RowToSave) {
	$RowToSave->save();
  }



?>
