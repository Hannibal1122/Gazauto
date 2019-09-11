<?php
    switch($nQuery)
    {
        case 200: // Добавить права
            if(($myRight->get((int)$param[0]) & 16) != 16) return; // Права на изменение
            $id = (int)$param[0];
            $elements = [ $id ];
            if($param[2] == "true") getRemoveElementbyStructure($elements, $id);
            for($j = 0, $countElements = count($elements); $j < $countElements; $j++)
            {
                $id = $elements[$j];
                $myRight->remove($id);
                $rights = json_decode($param[1]);
                for($i = 0, $c = count($rights); $i < $c; $i++)
                {
                    $login = $rights[$i]->login;
                    $type = $rights[$i]->type;
                    $_rights = (int)($rights[$i]->rights);
                    $myRight->create($id, $type, $login, $_rights);
                }
            }
            break;
        case 201: // Запросить права
            if(($myRight->get((int)$param[0]) & 16) != 16) return; // Права на просмотр
            $out = [];
            if($result = query("SELECT type, login, rights FROM rights WHERE objectId = %i", $param))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $elem = [];
                    $elem["type"] = $row[0];
                    $elem["login"] = $row[1];
                    $elem["rights"] = (int)$row[2];
                    $out[] = $elem;
                }
            echo json_encode($out);
            break;
        case 202: // Запросить права по логину, связи
            $idElement = (int)$param[0];
            echo json_encode([
                "right" => $paramL == "admin" ? 255 : $myRight->get($idElement),
                "bind" => selectOne("SELECT bindId FROM structures WHERE id = %i", [ $idElement ]), 
                "class" => selectOne("SELECT class FROM structures WHERE id = %i", [ $idElement ]),
                "classRoot" => selectOne("SELECT classId FROM structures WHERE id = %i", [ $idElement ]),
            ]);
            break;
    }
?>