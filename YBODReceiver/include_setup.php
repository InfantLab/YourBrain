<?

require_once 'include_utilities.php';
require_once 'include_config.php';

require_once 'include_database.php';

if (!db_connect()) finisherror ('Error connecting to database.');

require_once 'include_base.php';

require_once 'include_authentication.php';
