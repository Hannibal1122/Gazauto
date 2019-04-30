<?php
class FASM
{
    function __construct($myLog)
    {
        $this->myLog = $myLog;
    }
	function parse($str)
	{
        global $login;
        $str = str_replace("LOGIN", "\"$login\"", $str); // Заменяет константу на текущий логин
		$a = explode("\n", $str);
		$operandStr = "";
		$operandBool = false;
		$quotes = false;
		$strTime = "";
		$comment = false;
        $code = [];
		for($i = 0, $c = count($a); $i < $c; $i++)
		{
			$code[$i] = 
			[	
				"mark" => "",
				"operator" => "",
				"operand" => [],
				"comment" => ""
            ];
			$operandBool = false;
			$quotes = false;
			$comment = false;
            $strTime = "";
        
			for($j = 0, $c2 = strlen($a[$i]); $j < $c2; $j++)
			{
				if($quotes || $a[$i][$j] != " ") $strTime .= $a[$i][$j];
				if($a[$i][$j] == "\"" && !$quotes) $quotes = true;
				else if($a[$i][$j] == "\"" && $quotes) $quotes = false;
				if(!$comment && !$quotes && ($j > 0 && ($a[$i][$j] == " " || $j == $c2 - 1)))
				{
					if(($a[$i][$j] == " " && $a[$i][$j - 1] == ":") || ($j == $c2 - 1 && $a[$i][$j] == ":")) // ищем метку 
					{
						$code[$i]["mark"] = substr($strTime, 0, -1);
						$strTime = "";
					}
					else 
						if(!$operandBool) // ищем оператор 
						{
							$code[$i]["operator"] = $strTime;
							$strTime = "";
							$operandBool = true;
						}
						else // ищем операнды  
						{
							$code[$i]["operand"][] = str_replace("\"", "", $strTime);
							if($code[$i]["operand"]) $strTime = "";
						}
				}
				if(!$quotes && !$comment && $a[$i][$j] == ";") $comment = true; // ищем комментарии 
				else if($comment) $code[$i]["comment"] .= $a[$i][$j];
			}
		}
		return $code;
    }
    function start($str, $_idField, /* $idColumn = -1,  */$idLine = -1)
    {
        $code = $this->parse($str);
        $limit = 0;
        $i = 0;
        $marksPosition = [];
        for($i = 0, $c = count($code); $i < $c; $i++) // Получаем расположение меток, чтобы каждый раз не проходить массив в поисках
            if($code[$i]["mark"] != "")
                $marksPosition[$code[$i]["mark"]] = $i;
        /* echo json_encode($marksPosition); */
        /* echo json_encode($code); */
        $i = 0;
        $changeOperator = ["set", "eq", "ne", "l", "m", "le", "me"];
        while($limit < 1000) // limit - защита от зацикливания
		{
            $current = $code[$i];
            if(in_array($current["operator"], $changeOperator))
            {
                if($current["operand"][0] == "CURRENT") $idField = $_idField;
                else $idField = (int)$current["operand"][0];
                $value = $this->getField($idField);
            }
            switch($current["operator"])
            {
                case "goto": // перейти на метку 
                    $i = $marksPosition[$current["operand"][0]];
                    break; 
                case "set": // выставить значение
                    require_once("myTable.php");
                    $myTable = new MyTable($value["tableId"], $this->myLog);
                    $operand = $this->getFunction($current["operand"][1]);
                    if($value["type"] == "head") $myTable->setCell((object) ["id" => $this->getFieldByHead($idField, $idLine), "value" => $operand], false, false);
                    else $myTable->setCell((object) ["id" => $idField, "value" => $operand], false, false);
                    $i++;
                    break; 
                case "eq": // сравнить на равенство значение
                    if($value["value"] == $current["operand"][1]) $i = $marksPosition[$current["operand"][2]];
                    else $i++;
                    break; 
                case "ne": // сравнить на неравенство значение
                    if($value["value"] != $current["operand"][1]) $i = $marksPosition[$current["operand"][2]];
                    else $i++;
                    break; 
                case "l": // сравнить на меньше значение
                    if((int)$value["value"] < (int)$current["operand"][1]) $i = $marksPosition[$current["operand"][2]];
                    else $i++;
                    break; 
                case "m": // сравнить на больше значение
                    if((int)$value["value"] > (int)$current["operand"][1]) $i = $marksPosition[$current["operand"][2]];
                    else $i++;
                    break; 
                case "le": // сравнить на меньше и равно значение
                    if((int)$value["value"] <= (int)$current["operand"][1]) $i = $marksPosition[$current["operand"][2]];
                    else $i++;
                    break; 
                case "me": // сравнить на больше и равно значение
                    if((int)$value["value"] >= (int)$current["operand"][1]) $i = $marksPosition[$current["operand"][2]];
                    else $i++;
                    break; 
                case "end": return; // выйти из скрипта
                default: $i++;
            }
            $limit++;
        }
    }
    function getField($id)
    {
        $field = [];
        if($result = query("SELECT value, type, linkId, linkType, state, tableId FROM fields WHERE id = %i", [ (int)$id ]))
            while ($row = $result->fetch_array(MYSQLI_NUM)) 
            {
                $field["value"] = $row[0];
                $field["state"] = $row[4];
                $field["type"] = $row[1];
                $field["tableId"] = (int)$row[5];
                if($row[1] == "link")
                {
                    $field["linkId"] = (int)$row[2];
                    switch($row[3])
                    {
                        case "value":
                            if($value = query("SELECT value, type FROM my_values WHERE id = %i", [ $field["linkId"] ]))
                            {
                                $valueData = $value->fetch_array(MYSQLI_NUM);
                                if($valueData[1] == "array") $field["value"] = getListValueByKey($field["linkId"], $field["value"]);
                                else $field["value"] = $valueData[0];
                            }
                            break;
                        case "file":
                        case "table":
                            $field["value"] = selectOne("SELECT name FROM structures WHERE id = %i", [ $field["linkId"] ]);
                            break;
                        case "cell":
                            $value = getCellLink($field["linkId"], true);
                            $field["value"] = $value["value"];
                            break;
                    }
                }
            }
        return $field;
    }
    function getFieldByHead($idColumn, $idLine)
    {
        return selectOne("SELECT id FROM fields WHERE idColumn = %i AND i = %i", [ $idColumn, $idLine ]);
    }
    function getFunction($value)
    {
        // Проверка на функцию
        $enableFunc = ["unite"]; // Доступные функции
        $func = explode("(", $value);
        if(in_array($func[0], $enableFunc))
        {
            $operand = str_replace(")", "", $func[1]);
            switch($func[0])
            {
                case "unite":
                    $out = "";
                    $strArray = explode(",", $operand);
                    for($i = 0, $c = count($strArray); $i < $c; $i++)
                    {
                        echo (int)$strArray[$i][0];
                        if($strArray[$i][0] == "\"") echo "FUCK";
                        $out .= $strArray[$i];
                    }
                    return $out;
            }
        }
        return $value;
    }
}
?>