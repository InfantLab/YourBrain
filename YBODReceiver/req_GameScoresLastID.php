<?

  require_once ('include_setup.php');

  // check if we're logged in or not

  $UUID = $_REQUEST['UUID'];
  $AuthToken = $_REQUEST['AuthToken'];

  $loggedin = check_auth($UUID, $AuthToken);

  if ($loggedin) {
    $LastID = getLastGameScoreIDForUUID($UUID);

    $response = array(
      'status' => 'success',
      'Last' => $LastID,
    ); 
  } else {
    $response = array(
      'status' => 'fail',
      'message' => 'Not logged in',
    );
  }

  echo json_encode($response);

?> 
