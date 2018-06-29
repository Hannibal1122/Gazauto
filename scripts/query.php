<?php
    /* function query($sql, $record_values)
    {
        global $login;
        mainQuery("INSERT INTO main_log (type, value, date, login) VALUES(%s, %s, %s, %s)", [ strlen($sql), count($record_values), "@DATE@", $login ]);
        return mainQuery($sql, $record_values);
    } */
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
?>