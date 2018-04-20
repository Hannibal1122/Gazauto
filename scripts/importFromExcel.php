<?php
    $_param = json_decode($param);
    $nameFile = $_param[0];
    $template = (array)$_param[1]; // шаблоны
    $header = (array)$_param[2]; // заголовки
    $currentId = $_param[3];

    $Rights = getRightsForTable("rights", $paramL, $currentId);
    if($Rights[1] == 0) { echo json_encode(["ERROR", "Недостаточно прав!"]); return; }

    $countT = count($template);
    for($i = 0; $i < $countT; $i++) $template[$i] = (array)$template[$i];
    $countH = count($header);
    for($i = 0; $i < $countH; $i++) $header[$i] = (array)$header[$i];
    /* print_r($template); 
    print_r($header);  */
    require_once dirname(__FILE__) . '/PHPExcel.php';

    $objReader = PHPExcel_IOFactory::createReader('Excel2007');
    $objReader->setReadDataOnly(true);
    $objPHPExcel = $objReader->load("../tmp/".$nameFile);

    $desc = json_decode($objPHPExcel->getProperties()->getDescription());
    if($desc[0] != $currentId) { echo json_encode(["ERROR", "Загруженная таблица не совпадает с текущей!"]); return; } // Проверка по id
    for($i = 0; $i < $countH; $i++)
        if($objPHPExcel->getActiveSheet()->getCell(getExcelColumn($i * 2)."2")->getValue() != $header[$i]["name"]) break;
    if($i != $countH) { echo json_encode(["ERROR", "Шаблон загруженной таблицы не совпадает!"]); return; } // Проверка по шаблону
    /* print_r($header); */
    $update = [];
    $iUpdate = 0;
    $updateRow = false;
    $fileData = $objPHPExcel->getActiveSheet()->toArray();
    $countFD = count($fileData);
    for($i = 2; $i < $countFD; $i++)
        for($j = 0; $j < $countH * 2; $j += 2)
        {
            $value = $fileData[$i][$j];
            $data = $fileData[$i][$j + 1];
            //echo $i." ".$j." ".$value."==".$data."\n";
            if($data == "") { echo json_encode(["ERROR", "Структура загруженной таблицы нарушена!"]); return; } // Проверка структуры
            $dataJSON = json_decode($data);
            if($dataJSON->data != $value) $updateRow = true;
            $update[$iUpdate][] = $value ? $value : "";
            if($header[$j / 2]["endTable"] == 1)
            {
                $update[$iUpdate][] = $dataJSON->id;
                if($updateRow)
                {
                    $updateRow = false;
                    $iUpdate++;
                }
                else unset($update[$iUpdate]);
            }
        }
    
    if(count($update) == 0) { echo json_encode(["ERROR", "Изменений не обнаружено!"]); return; }
    //Обновление
    $countUpdate = count($update);
    for($i = 0; $i < $countUpdate; $i++)
    {
        $endElement = count($update[$i]) - 1;
        $idField = $update[$i][$endElement];
        unset($update[$i][$endElement]);
        query("UPDATE table_tree_big SET fields = %s WHERE id = %i", [json_encode($update[$i]), (int)$idField]);
    }
    echo json_encode(["OK"]);
    return;
    /* print_r($update); */
s?>