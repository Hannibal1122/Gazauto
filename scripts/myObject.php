<?php
    class MyObject
    {
        function __construct($idElement)
        {
            $this->id = (int)$idElement;
            $parentAndType = selectArray("SELECT parent, objectType, name FROM structures WHERE id = %i", [ $this->id ]);
            $this->parentId = (int)$parentAndType[0];
            $this->type = $parentAndType[1];
            $this->name = $parentAndType[2];
        }
        function checkRemove(&$out) // Проверка удаления элемента из класса // По id собирает все элементы для удаления
        {
            if($result = query("SELECT id FROM structures WHERE bindId = %i", [ $this->parentId ]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    $elementBind = (int)selectOne("SELECT id FROM structures WHERE parent = %i AND bindId = %i", [ (int)$row[0], $this->id ]);
                    if($elementBind == 0) continue;
                    $out[] = $elementBind;
                    if($this->type == "folder") getRemoveElementbyStructure($out, $elementBind);
                }
        }
        function checkAdd() // Проверка добавления элемента в класс
        {
            global $mysqli;
            $name = $this->name;
            $type = $this->type;
            if($result = query("SELECT id FROM structures WHERE bindId = %i", [ $this->parentId ]))
                while ($row = $result->fetch_array(MYSQLI_NUM)) 
                {
                    query("INSERT INTO structures (objectType, name, parent, bindId) VALUES(%s, %s, %i, %i)", [ $type, $name, (int)$row[0], $this->id ]);
                    $idElement = $mysqli->insert_id;
                    if($parent_right = query("SELECT type, login, rights FROM rights WHERE objectId = %i", [ (int)$row[0] ]))
                        while ($row2 = $parent_right->fetch_array(MYSQLI_NUM)) 
                        {
                            $right = [ $idElement , $row2[0], $row2[1], $row2[2] ];
                            query("INSERT INTO rights (objectId, type, login, rights) VALUES(%i, %s, %s, %i) ", $right);
                            addLog("right", "add", json_encode($right));
                        }
                    addLog("structure", "add", $idElement);
                }
        }
    }
?>