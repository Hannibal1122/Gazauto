<?php   
    $_param = json_decode($param);
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
    $data = (array)$_param[2];
    require_once dirname(__FILE__) . '/PHPExcel.php';
    $objPHPExcel = new PHPExcel();
    $styleArray = [
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
    /* $objPHPExcel->getProperties()->setCreator("Maarten Balliauw")
                                ->setLastModifiedBy("Maarten Balliauw")
                                ->setTitle("Office 2007 XLSX Test Document")
                                ->setSubject("Office 2007 XLSX Test Document")
                                ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
                                ->setKeywords("office 2007 openxml php")
                                ->setCategory("Test result file"); */                            
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
            /* $objPHPExcel->getActiveSheet()->getColumnDimension(getExcelColumn($k + 1))->setCollapsed(false);
            $objPHPExcel->getActiveSheet()->getColumnDimension(getExcelColumn($k + 1))->setVisible(false); */
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
            /* $objPHPExcel->getActiveSheet()->getStyle(getExcelColumn($k + 1).($i + 3))->getNumberFormat()->setFormatCode(';;;'); */
            if($data[$i][$j]["block"] == "1") $styleArray['fill']['startcolor']['rgb'] = 'e8f6ff';
            else $styleArray['fill']['startcolor']['rgb'] = 'f1ffe8';
            $objPHPExcel->getActiveSheet()->getStyle(getExcelColumn($k).($i + 3))->applyFromArray($styleArray);
        }
    }
    // Rename worksheet
    /*$objPHPExcel->getActiveSheet()->setTitle('Simple');
    $objPHPExcel->setActiveSheetIndex(0); */
    $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
    $nameFile = str_replace(" ", "_", $_param[3].date("_m_d_y_H_i_s"));
    $objWriter->save("../reports/$nameFile.xlsx");
    echo json_encode(["http://localhost:80/reports/$nameFile.xlsx", $nameFile]);
?>