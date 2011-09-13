    <?php  
    require_once ('include_setup.php'); 
      
    $username   = $_POST['username'];  
    $password   = $_POST['password'];  
    $names      = $_POST['names'];  
    $email      = $_POST['email'];  
      
    $sql        = "SELECT username,email FROM users WHERE username = '" . escape($username) . "' OR email = '" . escape($email) . "'";  
    $query      = db_query($sql) or finisherror('SQL error doing already-exists check:' . db_error();
    if (db_num_rows($query) > 0)  
    {  
	$response = array(
		'success' => false,
		'message' => 'That username or email already exists'
	);
	echo json_encode($response);
    }  
    else  
    {  
        $insert = "INSERT INTO users (UUID,username,password,email) VALUES (UUID(),'" . escape($username) . "',PASSWORD('" . escape($password) . "'),'" . escape($email) . "')";  
        $query  = db_query($insert);  
        if ($query)  
        {  
            // Select eveything from the users table where username field == the username we posted and password field == the password we posted so we can send back the newly created UUID
            $sql = "SELECT * FROM users WHERE username = '" . escape($username) . "' AND password = '" . escaepe($password) . "'";
            $subquery = db_query($sql);
            // If we find a match, create an array of data, json_encode it and echo it out
            if (db_num_rows($subquery) > 0)
            {
	        $row = db_fetch_array($subquery);
	        $response = array(
	        	'success' => true,
	        	'message' => 'Successfully registered with Boozerlyzer.net',
	        	'username' => $row['username'],
	        	'UUID' => $row['UUID'],
	        	'email' => $row['email']
		);
		echo json_encode($response);
	    }
	    else
	    { //Something weird has gone wrong. 
		$response = array(
			'success' => false,
	        	'message' => 'Something went wrong. Please try again. If problems persist, please contact support.'
	        );
		echo json_encode($response);
	    }
        }  
        else  
        {  
	    $response = array(
		'success' => false,
		'message' => 'Failed to add new user to database. Please try again. If problems persist, please contact support.'
	    );
	    echo json_encode($response); 
        }  
    }  


?>  
