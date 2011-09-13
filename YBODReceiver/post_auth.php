<?php
    require_once ('include_setup.php');

// $_POST['username'] and $_POST['password'] are the param names we sent in our click event in login.js
$username = $_POST['username'];
$password = $_POST['password'];

// Select eveything from the users table where username field == the username we posted and password field == the password we posted
$sql = "SELECT * FROM users WHERE username = '" . escape($username) . "' AND password = PASSWORD('" . escape($password) . "')";
$query = db_query($sql) or finisherror('SQL error');

// If we find a match, create an array of data, json_encode it and echo it out
if (db_num_rows($query) > 0)
{
	$row = db_fetch_array($query);
	$response = array(
		'logged' => true,
		'username' => $row['username'],
		'UUID' => $row['UUID'],
		'email' => $row['email'],
                'AuthToken' => auth_set_AuthToken($row['id'])
	);
	echo json_encode($response);
}
else
{
	// Else the username and/or password was invalid! Create an array, json_encode it and echo it out
	$response = array(
		'logged' => false,
                'sql' => $sql,
                'username' => $username,
                'password' => $password,
		'message' => 'Invalid Username and/or Password'
	);
	echo json_encode($response);
}
?>
  
