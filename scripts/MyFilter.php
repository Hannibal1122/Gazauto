<?php
    class MyFilter
    {
        function __construct()
        {
        }
        function create($value, $column)
        {
            global $mysqli;
            query("INSERT INTO filter (value, col) VALUES(%s, %s)", [ $value, $column ]);
            return $mysqli->insert_id;
        }
        function get($idFilter)
        {
            request("SELECT value, col FROM filter WHERE id = %i", [ $idFilter ]);
        }
        function update($idFilter, $value, $column)
        {
            query("UPDATE filter SET value = %s, col = %s WHERE id = %i", [$value, $column, $idFilter]);
        }
        function getAllFilters($idTable)
        {
            global $login, $role;
            $filterSelected = -1;
            $filters = [];
            $filterColumn = ["", ""];
            $filterStr = "";
            $userFilter = $this->getUserFilter($login, $idTable);
            $idTables = $idTable; // id таблицы обязательно, но еще может быть id наследуемой таблицы
            $bindId = selectOne("SELECT bindId FROM structures WHERE id = %i", [ $idTable ]);
            if(!is_null($bindId)) $idTables .= ", $bindId";
            $query = "SELECT id, objectId, name FROM structures WHERE parent IN ($idTables) AND objectType = 'filter' ";
            if($login != "admin") $query .= "AND id IN (SELECT objectId FROM rights WHERE (login = %s OR login = %s) AND rights & 1 
                    AND objectId NOT IN (SELECT objectId FROM rights WHERE login = %s AND (rights & 1) = 0)) ORDER by parent, priority";
            $query .= " ORDER by parent, priority";
            if($result = query($query, $login == "admin" ? [ ] : [ $login, $role, $login ]))
                while ($row = $result->fetch_array(MYSQLI_NUM))
                {
                    if(($userFilter == "" && count($filters) == 0) 
                        || ($userFilter != "" && $userFilter == $row[0]))
                    {
                        $filterStr = $this->getFilterStr((int)$row[1]);
                        $filterColumn = $this->getFilterColumn((int)$row[1]);
                        $filterSelected = (int)$row[0];
                    }
                    $filters[] = $row;
                }
            return [
                "filters" => $filters, 
                "filterSelected" => $filterSelected, 
                "filterStr" => $filterStr,
                "filterColumn" => $filterColumn
            ];
        }
        function getFilterStr($idFilter)
        {
            global $login;
            $str = "";
            $expression = json_decode(selectOne("SELECT value FROM filter WHERE id = %i", [ $idFilter ]));
            for($i = 0, $c = count($expression); $i < $c; $i++)
                if($expression[$i]->type === "group")
                {
                    if($expression[$i]->begin) $str .= "(";
                    if(!$expression[$i]->begin) 
                    {
                        $str .= ")";
                        if(array_key_exists($i + 1, $expression))
                            $str += $this->getOperator($expression[$i]->operator);
                    }
                }
                else
                {
                    $strI = "";
                    $operand = $this->getOperand($expression[$i]->operand, $expression[$i]->value); // защита от инъекции
                    if($result = query("SELECT i FROM fields WHERE idColumn = %i AND value ".$operand[0]." %s", [ $expression[$i]->field, str_replace("LOGIN", $login, $operand[1]) ])) // LOGIN - константа
                        while($row = $result->fetch_array(MYSQLI_NUM))
                        {
                            if($strI != "") $strI .= ",";
                            $strI .= $row[0];
                        }
                    if($strI == "") $strI = "-1";
                    $str .= "i IN ($strI)";
                    if(array_key_exists($i + 1, $expression) && ($expression[$i + 1]->type === "condition" || $expression[$i + 1]->begin))
                        $str .= $this->getOperator($expression[$i]->operator);
                }
            return $str;
        }
        function getFilterStrByFolder($idFilter, $idParent)
        {
            global $login;
            $str = "";
            $expression = json_decode(selectOne("SELECT value FROM filter WHERE id = %i", [ $idFilter ]));
            for($i = 0, $c = count($expression); $i < $c; $i++)
                if($expression[$i]->type === "group")
                {
                    if($expression[$i]->begin) $str .= "(";
                    if(!$expression[$i]->begin) 
                    {
                        $str .= ")";
                        if(array_key_exists($i + 1, $expression))
                            $str += $this->getOperator($expression[$i]->operator);
                    }
                }
                else
                {
                    $operand = $this->getOperand($expression[$i]->operand, $expression[$i]->value); // защита от инъекции
                    $value = ["1" => "name", "2" => "objectType", "3" => "hashtag"][$expression[$i]->field];
                    $strId = "";
                    if($result = query("SELECT id FROM structures WHERE parent = %i AND $value ".$operand[0]." %s", [ $idParent, $operand[1] ]))
                    while($row = $result->fetch_array(MYSQLI_NUM))
                        {
                            if($strId != "") $strId .= ",";
                            $strId .= $row[0];
                        }
                    if($strId == "") $strId = "-1";
                    $str .= "id IN ($strId)";
                    if(array_key_exists($i + 1, $expression) && ($expression[$i + 1]->type === "condition" || $expression[$i + 1]->begin))
                        $str .= $this->getOperator($expression[$i]->operator);
                }
            return $str;
        }
        function getFilterColumn($idFilter)
        {
            global $login;
            $str = ["", ""];
            $columns = json_decode(selectOne("SELECT col FROM filter WHERE id = %i", [ $idFilter ]));
            for($i = 0, $c = count($columns); $i < $c; $i++)
                if($columns[$i]->check === false)
                {
                    $id = (int)$columns[$i]->id;
                    $str[0] .= " AND id != ".$id; 
                    $str[1] .= " AND idColumn != ".$id;
                }
            return $str;
        }
        function getUserFilter($login, $idTable)
        {
            return selectOne("SELECT value FROM user_settings WHERE login = %s AND type = 'filter' AND id = %i", [$login, $idTable]);
        }
        function getOperand($operand, $value)
        {
            switch($operand)
            {
                case "содержит": return ["LIKE", "%$value%"];
                case "не содержит": return ["NOT LIKE", "%$value%"];
                case "начинается": return ["LIKE", "$value%"];
                case "заканчивается": return ["LIKE", "%$value"];
                case "равно": return ["LIKE", "$value"];
                case "не равно": return ["NOT LIKE", "$value"];
            }
        }
        function getOperator($operator)
        {
            switch($operator)
            {
                case "И": return " AND ";
                case "ИЛИ": return " OR ";
            }
        }
        function getStructureId($idFilter)
        {
            return selectOne("SELECT id FROM structures WHERE objectType = 'filter' AND objectId = %i", [$idFilter]);
        }
    }
?>