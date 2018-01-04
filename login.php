<?php
    include 'php/config.php';
    session_start();
    if ($_SESSION['login_user']) {
        header('location: index.php');
    } else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $username = mysqli_real_escape_string($MySQL, $_POST['username']);
        $password = mysqli_real_escape_string($MySQL, $_POST['password']);
        $sql = "SELECT id FROM `user` WHERE id = '$username' and password = '$password'";
        $result = mysqli_query($MySQL, $sql);
        $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
        $count = mysqli_num_rows($result);
        if ($count == 1) {
            $_SESSION['login_user'] = $username;
            header('location: index.php');
        } else {
            $error = 'Your Login Name or Password is invalid';
        }
    }
    echo $_SESSION['login_user'];
?>
<html>

<head>
    <title>Reservation: Login</title>
    <link rel="stylesheet" type="text/css" href="lib/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="css/login.css">
</head>
<body>
<div class="container">
    <form class="form-signin" action="" method="post">
        <h2 class="form-signin-heading">Please sign in</h2>
        <label for="username" class="sr-only">Username</label>
        <input name="username" id="username" type="text" class="form-control" placeholder="Your username" required autofocus>

        <label for="password" class="sr-only">Password</label>
        <input name="password" id="password" type="password" id="inputPassword" class="form-control" placeholder="Your password" required>

        <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>

        <div style="font-size:11px; color:#cc0000; margin-top:30px; text-align: center"><?php echo $error; ?></div>
    </form>

</div>
</html>