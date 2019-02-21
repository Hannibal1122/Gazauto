<?php   
    class WorkWithExcel
    {
        function export($data, $metaData)
        {
            require_once dirname(__FILE__).'/PHPExcel.php';
            $styleArray = [
                'fill' => [
                    'type' => PHPExcel_Style_Fill::FILL_SOLID,
                    'startcolor' => [ 'rgb' => "d6d6c5" ]
                ]
            ];
            $styleArrayHeader = 
            [
                'fill' => [
                    'type' => PHPExcel_Style_Fill::FILL_SOLID,
                    'startcolor' => [ 'rgb' => "70C8FF" ]
                ]
            ];
            $objPHPExcel = new PHPExcel();
            $activeSheet = $objPHPExcel->setActiveSheetIndex(0);
            $objPHPExcel->getProperties()->setDescription(json_encode($metaData));
            for($i = 0, $h = count($data); $i < $h; $i++)
                for($j = 0, $w = count($data[$i]); $j < $w; $j++)
                {
                    if($i == 0) $activeSheet->getColumnDimension(getExcelColumn($j))->setAutoSize(TRUE);
                    $value = "";
                    if(!is_null($data[$i][$j]))
                        if(is_array($data[$i][$j])) 
                        {
                            $value = $data[$i][$j]["value"]; 
                            if($data[$i][$j]["type"] == "cell" || $data[$i][$j]["type"] == "tlist") 
                                $objPHPExcel->getActiveSheet()->getStyle(getExcelColumn($j).($i + 1))->applyFromArray($styleArray);
                            if($data[$i][$j]["type"] == "head") 
                                $objPHPExcel->getActiveSheet()->getStyle(getExcelColumn($j).($i + 1))->applyFromArray($styleArrayHeader);
                        }
                        else $value = $data[$i][$j]; 
                    $activeSheet->setCellValueByColumnAndRow($j, $i + 1, $value);
                }
            $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
            $nameFile = str_replace(" ", "_", "test".date("_m_d_y_H_i_s"));
            $objWriter->save("../export/$nameFile.xlsx");
            /* echo json_encode(["http://localhost:8081/gazprom/export/$nameFile.xlsx", $nameFile]); */
            echo json_encode(["/export/$nameFile.xlsx", $nameFile]);
        }
        function import($nameFile, $table)
        {
            require_once dirname(__FILE__) . '/PHPExcel.php';
            $objReader = PHPExcel_IOFactory::createReader('Excel2007');
            $objReader->setReadDataOnly(true);
            $objPHPExcel = $objReader->load($nameFile);
            $_metaData = json_decode($objPHPExcel->getProperties()->getDescription());
            $out = [];
            $fileData = $objPHPExcel->getActiveSheet()->toArray();
            $metaData = [];
            for($i = 0, $c = count($_metaData); $i < $c; $i++) // Выпрямление объекта из stdObject в Array
            {
                $metaData[$i] = [];
                $j = 0;
                foreach($_metaData[$i] as $key => $value)
                {
                    if($key != $j)
                    {
                        for($k = $j; $k < $key; $k++) $metaData[$i][$k] = null;
                        $j = $k;
                    }
                    $metaData[$i][$j++] = $value;
                }
            }
            require_once("myField.php");
            $myField = new MyField();
            for($i = 0, $c = count($metaData); $i < $c; $i++)
                for($j = 0, $c2 = count($metaData[$i]); $j < $c2; $j ++)
                {
                    if(!isset($metaData[$i][$j])) continue;
                    $id = $metaData[$i][$j]->id;
                    $fieldData = selectArray("SELECT value, type, linkId, linkType, id FROM fields WHERE id = %i", [ $id ]);
                    if($fieldData[1] == "head") continue;
                    $field = [ "id" => (int)$fieldData[4], "value" => $fieldData[0] ];
                    if($fieldData[1] == "link")
                    {
                        $field["linkId"] = (int)$fieldData[2];
                        switch($fieldData[3])
                        {
                            case "tlist": 
                            case "value": $myField->getValue($field); break;
                            case "file": $myField->getFile($field, $fieldData[3]); break;
                            case "table": $myField->getTable($field, $fieldData[3]); break;
                            case "cell": $myField->getCell($field); break;
                        }
                    }
                    $oldValue = $field["value"];
                    if($fileData[$i][$j] != $oldValue)
                        $out[] = [ "id" => $id, "value" => $fileData[$i][$j], "oldValue" => $oldValue, "tableId" => $metaData[$i][$j]->tableId ];
                }
            echo(json_encode($out));
            unlink($nameFile); 
        }
    }
    /* $_param = json_decode($param);
    $_param[0] = (array)$_param[0]; // шаблоны
    $_param[1] = (array)$_param[1]; // заголовки
    $_param[2] = (array)$_param[2]; // данные
    $c = count($_param[0]);
    for($i = 0; $i < $c; $i++)
        $_param[0][$i] = (array)$_param[0][$i];
    $c = count($_param[2]);
    for($i = 0; $i < $c; $i++)
    {
        $_param[1][$i] = (array)$_param[1][$i];
        $_param[2][$i] = (array)$_param[2][$i];
        $c1 = count($_param[2][$i]);
        for($k = 0; $k < $c1; $k ++)
            $_param[2][$i][$k] = (array)$_param[2][$i][$k];
    }
    $data = (array)$_param[2]; */
    /* require_once dirname(__FILE__) . '/PHPExcel.php';
    $objPHPExcel = new PHPExcel(); */
    /* $styleArray = [
        'fill' => [
            'type' => PHPExcel_Style_Fill::FILL_SOLID,
            'startcolor' => [ 'rgb' => "70C8FF" ]
        ],
        'borders' => [
            'top' => [ 'style' => PHPExcel_Style_Border::BORDER_THIN, ],
            'left' => [ 'style' => PHPExcel_Style_Border::BORDER_THIN, ],
            'right' => [ 'style' => PHPExcel_Style_Border::BORDER_THIN, ],
            'bottom' => [ 'style' => PHPExcel_Style_Border::BORDER_THIN, ],
        ]
    ];
    $styleArrayHeader = 
    [
        'fill' => [
            'type' => PHPExcel_Style_Fill::FILL_SOLID,
            'startcolor' => [ 'rgb' => "70C8FF" ]
        ],
        'borders' => [
            'top' => [ 'style' => PHPExcel_Style_Border::BORDER_THIN, ],
            'left' => [ 'style' => PHPExcel_Style_Border::BORDER_THIN, ],
            'right' => [ 'style' => PHPExcel_Style_Border::BORDER_THIN, ],
            'bottom' => [ 'style' => PHPExcel_Style_Border::BORDER_THIN, ],
        ]
    ];
                          
    $objPHPExcel->getProperties()->setDescription(json_encode([$_param[4], $_param[0], $_param[1]]));
    $out = $objPHPExcel->setActiveSheetIndex(0);
    $idTable = -1;
    $c = count($data);
    for($i = 0; $i < $c; $i++)
    {
        $c1 = count($data[$i]) * 2;
        for($k = 0; $k < $c1; $k += 2)
        {
            $j = $k / 2;
            if($i == 0) // Заголовок
            {
                if($idTable != (int)$_param[1][$j]["idTable"])
                {
                    $idTable = (int)$_param[1][$j]["idTable"];
                    $out->setCellValueByColumnAndRow($k, 1, $_param[0][$idTable]["name"]);
                    $objPHPExcel->getActiveSheet()->getStyle(getExcelColumn($k)."1:".getExcelColumn($k + (int)$_param[0][$idTable]["n"]*2 - 2)."1")->applyFromArray($styleArrayHeader);
                }
                $out->setCellValueByColumnAndRow($k, 2, $_param[1][$j]["name"]);
                $objPHPExcel->getActiveSheet()->getStyle(getExcelColumn($k)."2")->applyFromArray($styleArrayHeader);
            }
            // тело
            $out->setCellValueByColumnAndRow($k, $i + 3, $data[$i][$j]["data"]);
            $out->setCellValueByColumnAndRow($k + 1, $i + 3, json_encode($data[$i][$j]));
            if($data[$i][$j]["block"] == "1") $styleArray['fill']['startcolor']['rgb'] = 'e8f6ff';
            else $styleArray['fill']['startcolor']['rgb'] = 'f1ffe8';
            $objPHPExcel->getActiveSheet()->getStyle(getExcelColumn($k).($i + 3))->applyFromArray($styleArray);
        }
    } */
    // Rename worksheet
    /* $activeSheet = $objPHPExcel->setActiveSheetIndex(0);
    for($i = 0; $i < 4; $i++)
        for($k = 0; $k < 4; $k += 2)
        {
            $activeSheet->setCellValueByColumnAndRow($k, $i, 1);
        }
    $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
    $nameFile = str_replace(" ", "_", "test".date("_m_d_y_H_i_s"));
    $objWriter->save("../export/$nameFile.xlsx");
    echo json_encode(["http://localhost:8081/gazprom/export/$nameFile.xlsx", $nameFile]); */
?>