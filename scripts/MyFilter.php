<?php
    class MyFilter
    {
        function __construct()
        {
            
        }
        function create($value)
        {
            global $mysqli;
            query("INSERT INTO filter (value) VALUES(%s)", [ $value ]);
            return $mysqli->insert_id;
        }
        function get($idFilter)
        {
            request("SELECT value FROM filter WHERE id = %i", [ $idFilter ]);
        }
        function update($idFilter, $value)
        {
            query("UPDATE filter SET value = %s WHERE id = %i", [$value, $idFilter]);
        }
        function getFilterStr($idFilter)
        {
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
                    if($expression[$i]->value !== "")
                    {
                        $str .= "i IN (SELECT i FROM fields WHERE idColumn = ".$expression[$i]->field." AND value ".$this->getOperand($expression[$i]->operand, $expression[$i]->value).")";
                        if(array_key_exists($i + 1, $expression) && ($expression[$i + 1]->type === "condition" || $expression[$i + 1]->begin))
                            $str .= $this->getOperator($expression[$i]->operator);
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
                case "содержит": return "LIKE '%$value%'";
                case "не содержит": return "NOT LIKE '%$value%'";
                case "начинается": return "LIKE '$value%'";
                case "заканчивается": return "LIKE '%$value'";
                case "равно": return "LIKE '$value'";
                case "не равно": return "NOT LIKE '$value'";
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
    }
?>