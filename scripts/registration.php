<?php
	$charPermit = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-@.";
	$newLogin = $param[0];
	$role = $param[1];
	$pass = $param[2];
	
    if (!preCheckL($newLogin) && !preCheckPass($pass)) // Далее проверяется правильность написания логина пароля и почты
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
        if(checkL2($array, $newLogin)) return false;
        $sult = unique_md5();
        $hash = myhash($pass, $sult);
        query("INSERT INTO password VALUES(%s,%s)", [$newLogin, $hash]);
        query("INSERT INTO registration VALUES(%s, %s, NOW())", [$newLogin, $role]);
        return true;
    }
    return false;
?>