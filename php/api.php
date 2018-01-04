<?php
    include 'config.php';

    $query = $_POST['query'];
    $error = mysqli_connect_errno();
    $res = array(
        'success' => false,
        'message' => null,
        'data' => null
    );

    if ($error) {
        $res['message'] = 'Error #'.$error.'. Failed connect to MySQL';
    } else if ($query) {
        $result = $MySQL->query($query);
        if (!$result) {
            $res['message'] = 'Error #'.$MySQL->errno.'. '.$MySQL->error;
        } else {
            $res['success'] = true;
            if ($result->num_rows > 0) {
                $data = array();
                while($row = $result->fetch_assoc()) {
                    $data[] = $row;
                }
                $res['data'] = $data;
            }
        }
        $MySQL->close();
    } else {
        $res['message'] = 'Empty query';
    }

    echo json_encode($res);
?>