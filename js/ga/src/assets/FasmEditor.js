//Онлайн редактор кода с подсветской синтаксиса
//var fasmEditor = new FasmEditor(0, 0, 510, 740, "#2E2E2E");
//document.getElementById(id).appendChild(fasmEditor.create());
class FasmEditor
{
	constructor(backColor, color, data, readonly) // инициализация
	{
		this.backColor = backColor || "#2E2E2E";
		this.color = color || "#ffffff";
		this.data = data || 
		[{
			words: ["goto", "set", "eq", "ne", "l", "m", "le", "me", "filter", "status"],
			color: "#39A0F9"
        },
        {
			words: ["unite", "get", "link"],
			color: "#a1f442"
        },
        {
			words: ["warning", "error"],
			color: "#f46242"
        },
		{
			words: ["end"],
			color: "#E84A4F"
        },
        {
			words: ["CURRENT", "LOGIN"],
			color: "#319638"
		},
		{
			words: ["(\\d)+"],
			color: "#52B6E0"
        }];
        this.readonly = readonly == undefined ? false : readonly;
		this.fasmEditor = document.createElement("div");
		this.numberLines = document.createElement("div");
		this.numberLines2 = document.createElement("div");
		this.backPanel = document.createElement("div");
		this.mainText = document.createElement("div");
		this.colorText = document.createElement("div");
	}
	create() // Подготовка регулярных выражений и назначение стилей редактора
	{
		this.fasmEditor.innerHTML = "";
		this.mainText.oninput = null;
		this.fasmEditor.appendChild(this.backPanel);
		this.fasmEditor.appendChild(this.numberLines2);
		this.backPanel.appendChild(this.numberLines);
		this.backPanel.appendChild(this.mainText);
		this.backPanel.appendChild(this.colorText);
		this.fasmEditor.setAttribute("style", "position: relative; width: 100%; height: 100%; font: 12px Lucida Console;");
		this.backPanel.setAttribute("style", "position: absolute; width: 100%; height: 100%; top: 0px; left: 0px; overflow: auto; background-color: " + this.backColor + ";");
		this.numberLines.setAttribute("style", "position: absolute; width: 15px; height: 100%; top: 0px; left: 0px; background-color: " + this.backColor + "; color: white; padding: 5px;");
		this.numberLines2.setAttribute("style", "position: absolute; width: 5px; height: 100%; top: 0px; left: 25px; background-color: #111111;");
		this.mainText.setAttribute("style", "position: absolute; width: calc(100% - 60px); height: 100%; top: 0px; left: 30px; color: #E7E981; opacity: 0.3; outline: none; word-wrap: break-word; padding: 5px;");
		this.mainText.setAttribute("contentEditable", !this.readonly);
		this.colorText.setAttribute("style", "position: absolute; width: calc(100% - 60px); height: 100%; top: 0px; left: 30px; pointer-events: none; color: white; word-wrap: break-word; padding: 5px;");
		this.regexp = "";
		for(var i = 0; i < this.data.length; i++)
		{
			if(i != 0) this.regexp += "|";
			for(var j = 0; j < this.data[i].words.length; j++)
			{
				if(j != 0) this.regexp += "|";
				this.regexp += "\\b" + this.data[i].words[j] + "\\b";
			}
		}
		this.regexp += "|\"[^\"]*\"";
		this.regexp = new RegExp(this.regexp, "g");
		
		(function(self)
		{
			self.mainText.oninput = function(e) { self.updateColorText(self) }
		})(this);
		
		return this.fasmEditor;
	}
	updateNumberLines()
	{
		this.numberLines.innerHTML = "";
		var a = this.mainText.getElementsByTagName("div");
		for(var i = 0; i < a.length; i++)
		{
			var j = $(a[i]).height() / 12;
			this.numberLines.innerHTML += (i + 1) + "<br>";
			for(var k = 1; k < j; k++)
				this.numberLines.innerHTML += "<br>";
		}
	}
	updateColorText(self) // подсветка текста
	{
		var str = self.mainText.innerHTML;
		var result = "";
		var output = "";
		var bIndex = 0;
		var color;
		while(result = self.regexp.exec(str))
		{
			color = "#D68A4B";
			output += str.substring(bIndex, result.index);
			for(var i = 0; i < self.data.length; i++)
			{
				for(var j = 0; j < self.data[i].words.length; j++)
					if(self.data[i].words[j] == result[0]) 
					{
						color = self.data[i].color;
						break;
					}
				if(j != self.data[i].words.length) break;
			}
			if(i == self.data.length)
			{
				if(result[0].search(/\"[^\"]*\"/) == -1)
					if(result[0].search(/\b(\d)+\b/) != -1) color = "#B474BE";
			}
			output += "<span style = 'color: " + color + "'>" + result[0] + "</span>";
			bIndex = self.regexp.lastIndex;
		}
		output += str.substring(bIndex);
		if(bIndex != 0) self.colorText.innerHTML = output;
		else self.colorText.innerHTML = str;
		self.updateNumberLines();
	}
	setText(value) // добавляем текст в редактор
	{
		var strArray = value.split("\n");
		var str = "";
		for(var i = 0; i < strArray.length; i++)
		{
			str += "<div>" + strArray[i] + "</div>";
		}
		this.mainText.innerHTML = str;
		this.updateColorText(this);
	}
	getFullText() // возвращаем текст из редактора
	{
		var regexp1 = new RegExp("(<[a-z]+>)", "g"); // Замена <div> на \n
		var regexp2 = new RegExp("(</[a-z]+>)", "g"); // Убирает закрывающие тэги
		var regexp3 = new RegExp("(( )*(&nbsp;)+)", "g"); // Убирает лишние пробелы
		var str = this.mainText.innerHTML.replace(regexp1, "\n").replace(regexp2, "").replace(regexp3, " ");
		var strArray = str.split("\n");
		var strArrayOut = [];
		for(var i = 0; i < strArray.length; i++)
			if(strArray[i] != "") strArrayOut.push(strArray[i]);
		str = "";
		for(var i = 0; i < strArrayOut.length; i++)
		{
			if(i != 0) str += "\n";
			str += strArrayOut[i];
		}
		this.setText(str);
		//trace(str)
		return str;
	}
}