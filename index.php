<?php include 'session.php'; ?>
<html>
<head>
    <title>Reservation</title>
    <link rel="stylesheet" type="text/css" href="lib/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="css/style.css">
    <script>
        window.LOGGEDBY = '<?php echo $login_session; ?>';
    </script>
</head>
<body>
<nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
    <a class="navbar-brand" href="#">Wooo</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse"
            aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbar">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
                <a class="nav-link" page="booking" href="#booking">Booking<span class="sr-only"> (current)</span></a>
            </li>
            <li class="nav-item">
                <a class="nav-link" page="payment" href="#payment">Payment</a>
            </li>
        </ul>
        <p style="margin: 0px; color: #fff; margin-right: 10px;">Logged by <?php echo $login_session; ?></p>
        <a href="logout.php" class="btn btn-sm btn-danger">Sign Out</a>
    </div>
</nav>
<main role="main" class="container">
</main>
<script type="text/javascript" src="lib/jquery/jquery-3.2.1.min.js"></script>
<script type="text/javascript" src="lib/bootstrap/js/bootstrap.min.js"></script>
<script type="text/javascript" src="app.js"></script>
</body>
</html>