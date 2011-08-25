<?

class GameScore extends BaseObject {
  function getTableName () {
    return 'receive_GameScore';
  }
/*
            [SessionID] => 2
            [PlayEnd] => 1310079664
            [Game] => StatLearning
            [Choices] => ""
            [TotalScore] => 10
            [GameScoreID] => 1
            [Coord_NOGO] => 0
            [GameVersion] => 1.0
            [data_type] => GameScore
            [PlayStart] => 1.31007966328E+12
            [Level] => 0
            [Feedback] => 
            [LabPoints] => 5
            [Coord_GO] => 0*/

  var $fields = array (
    'ID' => array('type' => 'primarykey'),
    'GameScoreID' => array('type' => 'int'),

    'CreatedByUserID' => array('type' => 'int'),

    'SessionID' => array('type' => 'int'),

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
