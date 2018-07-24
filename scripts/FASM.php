<?php
class FASM
{
    function __construct()
    {
        $this->code = [];
    }
	function parse($str)
	{
		$a = explode("\n", $str);
		$operandStr = "";
		$operandBool = false;
		$quotes = false;
		$strTime = "";
		$comment = false;
        $this->code = [];
		for($i = 0, $c = count($a); $i < $c; $i++)
		{
			$this->code[$i] = 
			[	
				"mark" => "",
				"operator" => "",
				"operand" => [],
				"comment" => ""
            ];
			$operandBool = false;
			$quotes = false;
			$comment = false;
            $strTime = "";
        
			for($j = 0, $c2 = strlen($a[$i]); $j < $c2; $j++)
			{
				if($quotes || $a[$i][$j] != " ") $strTime .= $a[$i][$j];
				if($a[$i][$j] == "\"" && !$quotes) $quotes = true;
				else if($a[$i][$j] == "\"" && $quotes) $quotes = false;
				if(!$comment && !$quotes && ($j > 0 && ($a[$i][$j] == " " || $j == $c2 - 1)))
				{
					if(($a[$i][$j] == " " && $a[$i][$j - 1] == ":") || ($j == $c2 - 1 && $a[$i][$j] == ":")) // ищем метку 
					{
						$this->code[$i]["mark"] = substr($strTime, 0, -1);
						$strTime = "";
					}
					else 
						if(!$operandBool) // ищем оператор 
						{
							$this->code[$i]["operator"] = $strTime;
							$strTime = "";
							$operandBool = true;
						}
						else // ищем операнды  
						{
							$this->code[$i]["operand"][] = str_replace("\"", "", $strTime);
							if($this->code[$i]["operand"]) $strTime = "";
						}
				}
				if(!$quotes && !$comment && $a[$i][$j] == ";") $comment = true; // ищем комментарии 
				else if($comment) $this->code[$i]["comment"] .= $a[$i][$j];
			}
		}
		return $this->code;
    }
    function start()
    {
        $code = $this->code;
        for($i = 0, $c = count($code); $i < $c; $i++)
		{
            switch($code[$i]["operator"])
            {
                case "goto":
                case "set":
                case "eq":
                case "ne":
                case "l":
                case "m":
                case "le":
                case "me":
            }
        }
    }
}
?>