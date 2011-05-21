<?

class BaseObject {

  function __construct($data) {
    $this->initialiseData($data);
  }

  function getFields () {
    return $this->fields;
  }

  function getPrimaryKey () {
    if ($this->primarykeyfield!='') {
      return $this->values[$this->primarykeyfield];
    }
  }

  function is_new() {
    return $this->getPrimaryKey()<=0;
  }


  function setValue ($FieldName, $value) {
    $this->values[$FieldName] = $value;
  }
  function getValue ($FieldName) {
    return $this->values[$FieldName];
  }
  function initialiseData($data) {
    foreach ($this->getFields() as $FieldName => $FieldOptions) {
      $this->setValue($FieldName, $data->$FieldName);
      if ($FieldOptions['type']=='primarykey') {
        $this->primarykeyfield = $FieldName;
      }
    }
  }

  function save() {
    //print_rp ($this->values, "save values:");
    if ($this->is_new()) {
      $sql = 'INSERT INTO ' . $this->getTableName() . ' ';
      foreach ($this->getFields() as $FieldName => $FieldOptions) {
        $sql_fields.= $FieldName . ', ';
        $sql_values.= "'" . escape($this->getValue($FieldName)) . "', ";
      }
      $sql_fields = substr($sql_fields,0,-2);
      $sql_values = substr($sql_values,0,-2);
      $sql.= '(' . $sql_fields . ') VALUES (' . $sql_values . ')';
    } else {
      $sql = 'UPDATE ' . $this->getTableName() . ' SET ';
      foreach ($this->getFields() as $FieldName => $FieldOptions) {
        $sql.= $FieldName . "='" . escape($this->getValue($FieldName)) . "', ";
      }
      $sql = substr($sql,0,-2);
      $sql.= ' WHERE ' . $this->primarykeyfield . '="' . escape($this->getPrimaryKey()) . "'";
    }

    //print 'save() produced sql :' . $sql;
    
    return db_query($sql); 
  }

  static function load($id) {
    $sql = 'SELECT * FROM ' . $this->getTableName() . ' WHERE ' . $this->primarykeyfield . '="' . escape($id) . '"';
    $results = db_query($sql) or finisherror('Error loading data: $sql' . db_error());
    if (db_num_rows($results)>0) {
      $result = db_fetch_object($results);
      return $this->newObject($result);
    }
  } 
  static function newObject($data) {
    $classname = get_class($this);
    return new $classname($data);
  } 
}
