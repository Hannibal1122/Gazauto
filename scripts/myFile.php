<?php
    class MyFile
    {
        function __construct()
        {
        }
        function loadFile($maxSize, $types) // Загрузка файла в tmp
        {
            if(!file_exists("../tmp")) mkdir("../tmp", 0700);
            if($_FILES["filename"]["size"] > 1024 * 1024 * $maxSize)
            {
                return json_encode(["Размер файла превышает $maxSize Mb"]);
                exit;
            }
            if(is_uploaded_file($_FILES["filename"]["tmp_name"])) // Проверяем загружен ли файл
            {
                $name = $_FILES["filename"]["name"];
                $end = strripos($name, "."); 
                $type = substr($name, $end + 1);
                if(in_array($type, $types))
                {
                    move_uploaded_file($_FILES["filename"]["tmp_name"], "../tmp/".$name);
                    return json_encode(["OK", $_FILES["filename"]["name"], $name]);
                } 
                else return json_encode(["Некорректный формат файла $type"]);
            }
            else return json_encode(["Ошибка загрузки файла"]);
        }
        function createFile($idElement, $fileName) // Загрузка из tmp в основную дирректорию
        {
            $end = strripos($fileName, "."); 
            $type = substr($fileName, $end + 1);
            if(!file_exists("../files/$idElement")) mkdir("../files/$idElement", 0700);
            if(file_exists("../tmp/$fileName")) rename("../tmp/$fileName", "../files/$idElement/$idElement.$type"); 

            if(in_array($type, ['gif', 'jpeg', 'png', 'jpg']))
            {
                if(!file_exists("../thumbs")) mkdir("../thumbs", 0700);
                if(!file_exists("../thumbs/$idElement")) mkdir("../thumbs/$idElement", 0700);
                if(file_exists("../files/$idElement/$idElement.$type"))
                    $this->resize("../files/$idElement/$idElement.$type", "../thumbs/$idElement/$idElement.$type", $type == "jpg" ? "jpeg" : $type, 100, 100);
                else $this->resize("../files/$idElement/$fileName", "../thumbs/$idElement/$fileName", $type == "jpg" ? "jpeg" : $type, 100, 100); // Старая версия
            }
        }
        function copy($idCopyFile, $idNewFile)
        {
            if(!file_exists("../files/$idCopyFile")) return "ERROR_COPY_FILE";
            if(!file_exists("../files/$idNewFile")) mkdir("../files/$idNewFile", 0700);
            if(!file_exists("../thumbs/$idNewFile")) mkdir("../thumbs/$idNewFile", 0700);

            $fileName = scandir("../files/$idCopyFile", 1)[0];
            copy("../files/$idCopyFile/$fileName", "../files/$idNewFile/$fileName");
            copy("../thumbs/$idCopyFile/$fileName", "../thumbs/$idNewFile/$fileName");
            return "";
        }
        function resize($file_input, $file_output, $ext, $w_o, $h_o) 
        {
            list($w_i, $h_i, $type) = getimagesize($file_input);
            if ((!$w_i || !$h_i) || ( $w_i < $w_o || $h_i < $h_o))
            {
                return;
            }
            $func = 'imagecreatefrom'.$ext;
            $img = $func($file_input);
            
            if ($w_o > $h_o) $h_o = $w_o / ($w_i / $h_i);
            else $w_o = $h_o / ($h_i / $w_i);

            $img_o = imagecreatetruecolor($w_o, $h_o);
            imagecopyresampled($img_o, $img, 0, 0, 0, 0, $w_o, $h_o, $w_i, $h_i);
            
            if ($type == 2) imagejpeg($img_o, $file_output, 100);
            else 
            {
                $func = 'image'.$ext;
                $func($img_o, $file_output);
            }
            imagedestroy($img_o);
        }
        function setField(&$field, $linkId)
        {
            $fileName = scandir("../files/$linkId", 1)[0];
            $type = $this->getFileType($fileName);
            if(in_array($type, ['gif', 'jpeg', 'png', 'jpg']))
            {
                $field["image"] = [ 
                    "path" => "$linkId/$fileName",
                    "source" => "files"
                ];
                if(file_exists("../thumbs/$linkId/$fileName")) $field["image"]["source"] = "thumbs";

                list($width, $height) = getimagesize("../".$field["image"]["source"]."/$linkId/$fileName");
                $field["image"]["width"] = $width;
                $field["image"]["height"] = $height;
                $field["image"]["type"] = $width > $height ? "horizon" : "vertical";
            }
        }
        function getFileType($fileName)
        {
            $end = strripos($fileName, "."); 
            return substr($fileName, $end + 1);
        }
    }
?>