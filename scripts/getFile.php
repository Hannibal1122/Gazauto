<?php // скачка файла с проверкой прав
    if (ob_get_level()) {
        ob_end_clean();
    }
    /* header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename=' . $name);
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($filePathForDownload));

    // Открыть файл для чтения и отдавать его частями
    if ($fd = fopen($filePathForDownload, 'rb')) {
        while (!feof($fd)) 
        {
            if (connection_aborted()) // Если соединение оборвано, то остановить скрипт
            {
                fclose($f);
                break;
            }
            print fread($fd, 1024);
            usleep(100000); // Пазуа в 0.1 секунду. Скорость отдачи 10000 байт/сек
        }
        fclose($fd);
    } */
    // заставляем браузер показать окно сохранения файла
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename=' . $fileBaseNameForDownload);
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($filePathForDownload));
    // читаем файл и отправляем его пользователю
    readfile($filePathForDownload);
    exit;
?>				