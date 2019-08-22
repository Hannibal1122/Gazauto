<?php
    function preCheckL($login)
	{
		global $charPermit;
		if (strlen($login) < 3 || strlen($login) > 32)
			return true;
		for ($i = 0;  $i < strlen($login); $i++)
		{
			for ($j = 0;  $j < strlen($charPermit) - 4; $j++)
				if ($login[$i] == $charPermit[$j]) 
					break;
			if($j == strlen($charPermit) - 4) break;
		}
		if($i != strlen($login))
			return true;
		return false;
	}
	function preCheckP($post)
	{
		global $charPermit;
		if (strlen($post) < 5 || strlen($post) > 32)
			return true;
		for ($i = 0;  $i < strlen($post); $i++)
		{
			for ($j = 0;  $j < strlen($charPermit); $j++)
				if ($post[$i] == $charPermit[$j]) 
					break;
			if($j == strlen($charPermit)) break;
		}
		if($i == strlen($post))
		{
			for($i = 0; $i < strlen($post); $i++)
				if($post[$i] == '@') break;
			if($i != strlen($post))
			{
				for($j = $i + 2; $j < strlen($post); $j++)
					if($post[$j] == ".") break;
				if($j < strlen($post) - 2)
					return false;
				else return true;
			}
			else return true;
		} else return true;
	}
	function preCheckPass($pass)
	{
		global $charPermit;
		if (strlen($pass) < 6 || strlen($pass) > 32)
			return true;
		for ($i = 0;  $i < strlen($pass); $i++)
		{
			for ($j = 0;  $j < strlen($charPermit) - 4; $j++)
				if ($pass[$i] == $charPermit[$j]) 
					break;
			if($j == strlen($charPermit) - 4) break;
		}
		if($i != strlen($pass))
			return true;
		return false;
	}	
	function checkL2($array, $login)
	{
		for ($i = 0;  $i < count($array); $i++)
			if($array[$i] == $login) 
				return true;
		return false;
	}
	function checkP2($array, $post)
	{
		for ($i = 0;  $i < count($array); $i++)
			if($array[$i] == $post) 
				return true;
		return false;
    }
    function unique_md5() 
	{
		mt_srand((int)(microtime(true) * 100000 + memory_get_usage(true)));
		return md5(uniqid(mt_rand(), true));
    }
	function myhash($password, $unique_salt) 
	{  
		return crypt($password, '$2a$10$'.$unique_salt); 
    }
    $excelNumber = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    $countExcelNumber = count($excelNumber);
    function getExcelColumn($digest)
    {
        global $excelNumber, $countExcelNumber;
        $digest++;
        $result;
        $str = "";
        while(($digest != 0) || ($digest > $countExcelNumber)) {
            if($digest % $countExcelNumber == 0) {
                $str = $excelNumber[$countExcelNumber - 1].$str;
                $digest--;
            }
            else $str = $excelNumber[$digest % $countExcelNumber - 1].$str;
            $digest = (int)($digest / $countExcelNumber);
        }
        $result = $str;
        return $result;
    }
    function loadFile($maxSize, $types)
    {
        if (!file_exists("../tmp")) mkdir("../tmp", 0700);
        if($_FILES["filename"]["size"] > 1024*$maxSize*1024)
        {
            return json_encode(["Размер файла превышает $maxSize Mb"]);
            exit;
        }
        if(is_uploaded_file($_FILES["filename"]["tmp_name"]))// Проверяем загружен ли файл
        {
            $name = $_FILES["filename"]["name"];
            $end = strripos($name, "."); 
            $type = substr($name, $end + 1);
            if (in_array($type, $types))
            {
                /* $name = substr($name, 0, $end).date("_m_d_y_H_i_s").substr($name, $end); */
                move_uploaded_file($_FILES["filename"]["tmp_name"], "../tmp/".$name);
                return json_encode(["OK", $_FILES["filename"]["name"], $name]);
            } 
            else return json_encode(["Некорректный формат файла $type"]);
        }
        else return json_encode(["Ошибка загрузки файла"]);
    }
    function checkL($array, $login) // Проверка логина
	{
		for ($i = 0;  $i < count($array); $i++)
			if($array[$i] == $login) return json_encode(["yes"]);
		return json_encode(["no"]);
    }
    function recodeRights($_rights, $n) // Права хранятся в int формате побитово
    {
        $out = [];
        for($i = 0; $i < $n; $i++)
        {
            $out[] = $_rights & 1;  
            $_rights >>= 1;
        }
        return $out;
    }
    function getFileType($fileName)
    {
        $end = strripos($fileName, "."); 
        return substr($fileName, $end + 1);
    }
?>