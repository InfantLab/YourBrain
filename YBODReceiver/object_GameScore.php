<?

class GameScore extends BaseObject {
  function getTableName () {
    return 'receive_GameScore';
  }
  var $fields = array (
    'GameScoreID' => array('type' => 'primarykey'),
    'remote_id' => array('type' => 'int'),
    'remote_session_id' => array('type' => 'int'),
    'remote_user_id' => array('type' => 'int'),

    'Game' => array('type' => 'string'),
    'GameVersion' => array('type' => 'string'),
    'PlayStart' => array('type' => 'datetime'),
    'PlayEnd' => array('type' => 'datetime'),
    'TotalScore' => array('type' => 'int'),
    'Speed_GO' => array('type' => 'int'),
    'Speed_NOGO' => array('type' => 'int'),
    'Coord_GO' => array('type' => 'int'), 
    'Coord_NOGO' => array('type' => 'int'),
    'Level' => array('type' => 'int'),
    'Inhibition' => array('type' => 'int'),
    'Feedback' => array('type' => 'text'),
    'Choices' => array('type' => 'text'), // maybe make a special 'jsonstring' type to deal with nested/specific data for each game type
    'LabPoints' => array('type' => 'int'),
  );

}
