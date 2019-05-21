<?php
class FASM
{
    function __construct($myLog)
    {
        global $login;
        $this->myLog = $myLog;
        $this->myLog->login = "system";
        $this->login = $login;
        $this->current = ["id" => -1, "field" => []];
    }
	function parse($str)
	{
        $str = str_replace("LOGIN", "\"$this->login\"", $str); // Заменяет константу на текущий логин
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
							$code[$i]["operand"][] = stripos($strTime, "unite") === false ? str_replace("\"", "", $strTime) : $strTime; // Если unite, то кавычки надо сохранить
							if($code[$i]["operand"]) $strTime = "";
						}
				}
				if(!$quotes && !$comment && $a[$i][$j] == ";") $comment = true; // ищем комментарии 
				else if($comment) $code[$i]["comment"] .= $a[$i][$j];
			}
		}
		return $code;
    }
    function start($str, $_idField, $idLine = -1)
    {
        $code = $this->parse($str);
        $this->current["id"] = $_idField;
        $this->current["field"] = $this->getField($_idField);
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
                if($current["operand"][0] == "CURRENT") 
                {
                    $idField = $this->current["id"];
                    $value = $this->current["field"];
                }
                else 
                {
                    $idField = (int)$current["operand"][0];
                    $value = $this->getField($idField);
                }
            }
            switch($current["operator"])
            {
                case "goto": // перейти на метку 
                    $i = $marksPosition[$current["operand"][0]];
                    break; 
                case "set": // выставить значение
                    require_once("myTable.php");
                    $myTable = new MyTable($value["tableId"], $this->myLog);
                    $operand = $this->getFunction($current["operand"][1], $idLine);
                    if(array_key_exists(2, $current["operand"]) && $current["operand"][2] == "link")
                    {
                        if($value["type"] == "head") $idCellTo = $this->getFieldByHead($idField, $idLine);
                        else $idCellTo = $idField;
                        $myTable->copyCell($idCellTo, $value["tableId"], $operand["id"], $operand["tableId"], "copy", "cell", false);
                    }
                    else
                    {
                        if($value["type"] == "head") $myTable->setCell((object) ["id" => $this->getFieldByHead($idField, $idLine), "value" => $operand["value"]], false, false);
                        else $myTable->setCell((object) ["id" => $idField, "value" => $operand["value"]], false, false);
                    }
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
                case "filter":
                    query("UPDATE my_values SET filterId = %i WHERE id = (SELECT objectId FROM structures WHERE id = %i)", [ (int)$current["operand"][1], (int)$current["operand"][0] ]);    
                    $i++;
                    break;
                case "msg":
                    $operand = $this->getFunction($current["operand"][1], $idLine);
                    $this->myLog->add("message", $current["operand"][0], $operand["value"]);
                    $i++;
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
        $row = selectArray("SELECT value, type, linkId, linkType, state, tableId FROM fields WHERE id = %i", [ (int)$id ]);
        $field["id"] = $id;
        $field["value"] = $row[0];
        $field["state"] = $row[4];
        $field["type"] = $row[1];
        $field["tableId"] = (int)$row[5];
        if($row[1] == "link")
        {
            $field["linkId"] = (int)$row[2];
            switch($row[3])
            {
                case "tlist":
                    if($value = query("SELECT value, tableId FROM my_values WHERE id = %i", [ $field["linkId"] ]))
                    {
                        $valueData = $value->fetch_array(MYSQLI_NUM);
                        $field["value"] = getTableListValueByKey((int)$field["value"], (int)$valueData[1]);
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
        return $field;
    }
    function getFieldByHead($idColumn, $idLine)
    {
        return selectOne("SELECT id FROM fields WHERE idColumn = %i AND i = %i", [ $idColumn, $idLine ]);
    }
    function getFunction($value, $idLine)
    {
        // Проверка на функцию
        $enableFunc = ["unite", "get"]; // Доступные функции
        $func = explode("(", $value);
        if(in_array($func[0], $enableFunc))
        {
            $operand = str_replace(")", "", $func[1]);
            $out = "";
            $strArray = explode(",", $operand);
            switch($func[0])
            {
                case "unite": // Объединяет строки и значения ячеек. Так же можно получить значение по заголовку
                    for($i = 0, $c = count($strArray); $i < $c; $i++)
                    {
                        $outValue = "";
                        if($strArray[$i][0] == "\"") $outValue = str_replace("\"", "", $strArray[$i]); // Если строка
                        else 
                        {
                            $id = (int)$strArray[$i];
                            $type = selectOne("SELECT type FROM fields WHERE id = %i", [ $id ]);
                            if($type == "head") $outValue = $this->getField((int)$this->getFieldByHead($id, $idLine))["value"];
                            else $outValue = $this->getField($id)["value"];
                        }; // Если id
                        $out .= $outValue;
                    }
                    return ["value" => $out];
                case "get":
                    $idFrom = (int)$strArray[0]; // Откуда получить значение. Только id(заголовок)
                    $idCondition = (int)$strArray[1]; // Столбец в котором надо найти условие. Только id(заголовок)
                    $condition = $strArray[2]; // Само значение, по которому надо сравнить
                    if($condition == "CURRENT") $condition = $this->current["field"]["value"];
                    $idLine = selectOne("SELECT i FROM fields WHERE idColumn = %i AND value = %s", [ $idCondition, $condition ]);
                    return $this->getField((int)$this->getFieldByHead($idFrom, $idLine));
            }
        }
        return ["value" => $value];
    }
}
?>