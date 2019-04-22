<?php
    class MyRight
    {
        function __construct($myLog)
        {
            $this->myLog = $myLog;
        }
        function create($idElement, $type, $login, $right)
        {
            $rightProp = [ $idElement , $type, $login, $right ];
            query("INSERT INTO rights (objectId, type, login, rights) VALUES(%i, %s, %s, %i) ", $rightProp);
            $this->myLog->add("right", "add", json_encode($right));
        }
        function get($objectId, $useFilter = false)
        {
            global $login, $role;
            $rights = 0;
            $use_login = false;
            if($login == "admin") $rights = 255;
            else 
                if($result = query("SELECT type, rights FROM rights WHERE objectId = %i AND (login = %s OR login = %s)", [$objectId, $login, $role]))
                    while ($row = $result->fetch_array(MYSQLI_NUM)) 
                    {
                        if(!$use_login) $rights = (int)$row[1];
                        if($row[0] == "user") $use_login = true;
                    }
            if($useFilter === true)
            {
                $currentFilter = selectOne("SELECT value FROM user_settings WHERE login = %s AND type = 'current_filter'", [ $login ]);
                if(!is_null($currentFilter))
                    if(is_null(selectOne("SELECT id FROM filter WHERE name = %s AND login = %s AND objectId = %i", [ $currentFilter, $login, $objectId ]))) $rights = $rights & 254;
            }
            return $rights;
        }
        function remove($id)
        {
            query("DELETE FROM rights WHERE objectId = %i", [ $id ]);
        }
        function update()
        {
        }
    }
?>