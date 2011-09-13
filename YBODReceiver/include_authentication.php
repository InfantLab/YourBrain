<?

function auth_set_AuthToken($UserID) {
  $AuthToken = md5(rand());  // our magic key generated
  $sql = "UPDATE users SET AuthToken='" . escape($AuthToken) . "' WHERE id='" . escape($UserID) . "'";
  //print_rp ('auth_set_AuthToken for UserID ' . $UserID . ' setting AuthToken to ' . $AuthToken, '', true);
  db_query($sql) or finisherror ("Couldn't set AuthToken: " .db_error());
  return $AuthToken;
}

function check_auth($UUID, $AuthToken) {
  $sql = "SELECT * FROM users WHERE UUID='" . escape($UUID) . "' AND AuthToken='" .escape($AuthToken) . "'";

  $result = db_query($sql) or finisherror ("SQL error checking login: " . db_error());

  if (db_num_rows($result)>0) {
    //success
    return true;
  } else {
    //failed
    return false;
  }
}

function getUserIDForUUID($UUID) {
  $sql = "SELECT id FROM users WHERE UUID='" . escape($UUID) . "'";
  $result = db_query($sql) or finisherror ("SQL error geting UserID for UUID: '" . $sql . "': " . db_error());

  $result = db_fetch_object($result);
  return $result->id;
}

