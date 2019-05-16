<?php
    function query($sql, $record_values)
    {
        global $mysqli, $nQuery;
        $arr = array();
        $sql_bind_string = "";
        $sql_len = strlen($sql);
        $i_count_prepare = 0;
        for ($i = 0; $i < $sql_len; $i++)
        {
            if ($sql[$i] == '%' && $i < $sql_len - 1) // && ($i == $sql_len - 2 || $sql[$i + 1] == " " || $sql[$i + 1] == ",")
            {
                $i_count_prepare++;
                switch($sql[$i + 1])
                {
                    case "i":
                        $sql_bind_string .= "i";
                        $sql[$i] = "?";
                        $sql[$i + 1] = " ";
                        break;
                    case "d":
                        $sql_bind_string .= "d";
                        $sql[$i] = "?";
                        $sql[$i + 1] = " ";
                        break;
                    case "s":
                        $sql_bind_string .= "s";
                        $sql[$i] = "?";
                        $sql[$i + 1] = " ";
                        break;
                    case "o":
                        $sql[$i] = " ";
                        $sql[$i + 1] = " ";
                        //$sql_bind_string .= "DESC";
                        break;
                    default: 
                        $i_count_prepare--;
                        break;
                }
            }
        }
        if ($i_count_prepare != count($record_values)) return false;
        $arr[] = $sql_bind_string;
        for ($i = 0; $i < count($record_values); $i++) $arr[] = $record_values[$i];
        $stmt = $mysqli->prepare($sql);
        if (count($record_values) > 0) call_user_func_array(array($stmt, 'bind_param'), refValues($arr));
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();
        return $result;
    }
    function refValues($arr)
	{
		if (strnatcmp(phpversion(), '5.3') > 0)
		{
			$refs = array();
			foreach($arr as $key => $value)
				$refs[$key] = &$arr[$key];
			return $refs;
		}
		return $arr;
    }
    function request($_query, $param) // Отправка запроса и получение ответа в формате JSON
    {
        global $mysqli;
        $Result = [];
        if($result = query($_query, $param))
        {
            while ($row = $result->fetch_array(MYSQLI_NUM)) 
                $Result[] = $row;
            echo json_encode($Result);
        }
        else if ($result == 0) echo json_encode(["Index", $mysqli->insert_id]);
        else echo json_encode(["Error", $mysqli->error]);
    }
    function selectOne($_query, $param) // Запрос одного значения
    {
        return query($_query, $param)->fetch_array(MYSQLI_NUM)[0];
    }
    function selectArray($_query, $param) // Запрос одного значения
    {
        return query($_query, $param)->fetch_array(MYSQLI_NUM);
    }
    function getNextDateForEvent($_dateTime) // Функция для работы с временными событиями
    {
        $countX = substr_count($_dateTime, "xx");
        $currentTime = selectOne("SELECT NOW()", []);
        $dateTime = $_dateTime.":00";
        $error = "";
        switch($countX)
        {
            case 2: // Каждый год
                $dateTime = str_replace("xxxx", mb_strcut($currentTime, 0, 4), $dateTime);
                $error = "+1 year";
                break;
            case 3: // Каждый месяц
                $dateTime = str_replace("xxxx-xx", mb_strcut($currentTime, 0, 7), $dateTime);
                $error = "+1 month";
                break;
            case 4: // Каждый день
                $dateTime = str_replace("xxxx-xx-xx", mb_strcut($currentTime, 0, 10), $dateTime);
                $error = "+1 day";
                break;
        }
        $currentTime = new DateTime($currentTime);
        $date = new DateTime($dateTime);
        if($currentTime > $date && $error != "") $date->modify($error);
        return $date;
    }
?>