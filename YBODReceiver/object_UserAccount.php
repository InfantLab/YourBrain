<?

$DB_USERTABLE = 'users';

class UserAccount extends BaseObject {
  var $username;
  var $adminlevel = 0;
  var $encryptedPassword;

  var $fields = array (
    'id' => array('type' => 'primarykey'),
    'username' => array('type' => 'string'),
    'adminlevel' => array('type' => 'int'),
  );

  static function Login($username, $password) {
    $sql = "SELECT * FROM $DB_USERTABLE WHERE username LIKE '" . escape($username) . "' AND password LIKE PASSWORD('" . escape($password) . ")' LIMIT 1 ";
    $results = db_query($sql) or finisherror("SQL error attempting to log in.");
    if (db_num_rows($results)==0) {
      return false;
    } else {
      $result = db_fetch_object($results);
      return new UserAccount($result);
    }
  }

}
