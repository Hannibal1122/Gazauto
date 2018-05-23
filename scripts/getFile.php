<?php // скачка файла с проверкой прав
    /* header('Access-Control-Allow-Origin: *'); */
    /* $file = "../files/116/evil-plan-baby.jpg"; */
   /*  $file = "./config.php";   */

    $fsize = filesize($filePathForDownload);

    Header("HTTP/1.1 200 OK");
    Header("Connection: close");
    Header("Content-Type: application/octet-stream");
    Header("Accept-Ranges: bytes");
    Header("Content-Disposition: Attachment; filename=".basename($filePathForDownload));
    Header("Content-Length: ".$fsize);

    // Открыть файл для чтения и отдавать его частями
    $f = fopen($filePathForDownload, 'r');
    while (!feof($f)) 
    {
        if (connection_aborted()) // Если соединение оборвано, то остановить скрипт
        {
            fclose($f);
            break;
        }
        echo fread($f, 10000);
        sleep(1); // Пазуа в 1 секунду. Скорость отдачи 10000 байт/сек
    }
    fclose($f);
?>				