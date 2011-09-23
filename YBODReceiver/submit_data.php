<? //submit_data.php
  require_once('include_setup.php');

 if (isset($HTTP_RAW_POST_DATA)) {
    $_REQUEST = json_decode(file_get_contents('php://input'));
  }


  // some debug info
  print_rp($_REQUEST, 'Request is:', true);


  $accepted_types = array('GameScore'); // which row types to accept for entry to the database

  // get the authorisation credentials
  $UUID = $_REQUEST['UUID'];
  $AuthToken = $_REQUEST['AuthToken'];

  //print_rp("submit_data.php: got UUID '$UUID' and AuthToken '$AuthToken'");
  print_rp($_REQUEST, 'Got REQUEST:',true);

  // if we weren't just a simple test app, we should check those against our database and do something appropriate if they're not correct.

  if (check_auth($UUID,$AuthToken)) {
    $UserID = getUserIDForUUID($UUID);
    setUserID ($UserID);
  } else {
    finisherror ('Authentication failed!');
  }

  // get the version that the client claims to be.  enables us to handle old buggy clients and catch silly errors during development.
  $ClientVersion = $_REQUEST['ClientVersion'];
  $ProtocolVersion = $_REQUEST['ProtocolVersion'];
  // if we weren't just a simple test app, we should take these things into account and maybe change our behaviour depending on what the client is expecting.  
  // for example, we might need to rescale or reformat values, or map to new column names, or just tell the client that they're out of date and can't submit any more.


  // take POST request, get authentication details and data
  $data = stripslashes($_REQUEST['data']); // the data as a JSON string.
  print_rp ($data, 'got data:', true);
  $decoded = json_decode($data); // the data as a tree of associative arrays

  print_rp ($decoded, 'Got decoded JSON data:', true);

  $RowsToSave = array ();

  foreach ($decoded as $key => $data) {
    print_rp($data, 'Got row:',true);
    if (in_array($data->data_type, $accepted_types))
      $newObject = new $data->data_type ($data->data);
      $newObject->setValue('UUID',$UUID);
      $RowsToSave[] = $newObject;
  }


  foreach ($RowsToSave as $RowToSave) {
    print_rp($RowToSave, 'Saving row:', true);
    if (!$RowToSave->save()) {
      $failed = true;
      break;
    }
  }
  $sql = "SELECT MAX(GameScoreID) FROM receive_GameScore WHERE UUID='{$UUID}'";
  $result = db_query($sql) or finisherror ('SQL error getting max GameScoreID');
  if (db_num_rows($result)>0) {
    $result = db_fetch_array($result);
    $LastID = $result[0];
  }
  
  print_rp('returning LastID ' . $LastID, '', true);

  if (!$failed) {
    $response = array (
      'status' => 'success',
      'LastReceivedID' => $LastID,
      'SavedCount' => sizeof($RowsToSave)
    );
  } else {
    $response = array (
      'status' => 'failed',
      'responseText' => 'Error saving data - last saved item had GameScoreID ' . $LastID . '!',
      'LastReceivedID' => $LastID,
    );
  }

  echo json_encode($response);

?>
