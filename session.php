<?php
    include 'php/config.php';
    session_start();
    $user_check = $_SESSION['login_user'];
    $ses_sql = mysqli_query($MySQL, "select id from `user` where id = '$user_check' ");
    $row = mysqli_fetch_array($ses_sql, MYSQLI_ASSOC);
    $login_session = $row['id'];
    if (!isset($_SESSION['login_user'])) {
        header('location:login.php');
    }
?>