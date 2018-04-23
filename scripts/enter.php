<?php
	$login = $paramL;
	$id = $paramI;
	$hash_in = $param[0];
	$hash = "";
	
	if($result = query("SELECT hash FROM password WHERE login = %s", array($login)))
		while ($row = $result->fetch_array(MYSQLI_NUM))
			for ($i = 0;  $i < count($row); $i++) $hash = $row[$i];
			
	if (check_password($hash, $hash_in)) 
	{
		$key = unique_md5();
		$name = "";
		query("UPDATE signin SET checkkey = %s, login = %s WHERE id = %s", [$key, $login, $id]);
		/* if($result = query("UPDATE signin SET checkkey = %s, login = %s WHERE id = %s", array($key, $login, $id)))
			if($result = query("SELECT name FROM registration WHERE login = %s", array($login)))
				while ($row = $result->fetch_array(MYSQLI_NUM)) $name = $row["name"]; */
		echo json_encode(array($key, $login, $name));
	}
	else echo json_encode(array("cced31a3-ebea-4541-841f-271ad5deedb8"));  
		
	function check_password($hash, $password) 
	{  
		// первые 29 символов хеша, включая алгоритм, «силу замедления» и оригинальную «соль» поместим в переменную  $full_salt
		$full_salt = substr($hash, 0, 29);   
		// выполним хеш-функцию для переменной $password  
		$new_hash = crypt($password, $full_salt);   
		//echo $new_hash." ";
		// возвращаем результат («истина» или «ложь»)  
		return ($hash == $new_hash); 
	}
?>