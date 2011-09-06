<?php
    require_once ('include_setup.php');

// $_POST['username'] and $_POST['password'] are the param names we sent in our click event in login.js
$username = $_POST['username'];
$password = $_POST['password'];

// Select eveything from the users table where username field == the username we posted and password field == the password we posted
$sql = "SELECT * FROM users WHERE username = '" . $username . "' AND password = '" . $password . "'";
$query = mysql_query($sql);

// If we find a match, create an array of data, json_encode it and echo it out
if (mysql_num_rows($query) > 0)
{
	$row = mysql_fetch_array($query);
	$response = array(
		'logged' => true,
		'username' => $row['username'],
		'UUID' => $row['UUID'],
		'email' => $row['email']
	);
	echo json_encode($response);
}
else
{
	// Else the username and/or password was invalid! Create an array, json_encode it and echo it out
	$response = array(
		'logged' => false,
		'message' => 'Invalid Username and/or Password'
	);
	echo json_encode($response);
}
?>
  