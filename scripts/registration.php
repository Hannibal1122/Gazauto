<?php
	$charPermit = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-@.";
	$login = $param[0];
	$role = $param[1];
	$pass = $param[2];
	
    if (!preCheckL($login)/*  && !preCheckP($mail) */ && !preCheckPass($pass)) // Далее проверяется правильность написания логина пароля и почты
    {
        $array = [];
        $j = 0;
        if($result = query("SELECT login FROM registration", []))
            while ($row = $result->fetch_array(MYSQLI_NUM))
                for ($i = 0;  $i < count($row); $i++)
                {
                    $array[$j] = $row[$i];
                    $j++;
                }
        $bool = false;
        if(!checkL2($array, $login)) $bool = true;
        else echo json_encode(["no"]);
        if ($bool)
        {
            $sult = unique_md5();
            $hash = myhash($pass, $sult);
            query("INSERT INTO password VALUES(%s,%s)", [$login, $hash]);
            query("INSERT INTO registration VALUES(%s, %s, %s)", [$login, $role, $current_time]);
            echo json_encode(["yes", "yes", "yes"]);
        }
    }
?>