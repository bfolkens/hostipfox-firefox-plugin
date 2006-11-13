function hostipfox_Tooltip(original, url, hostname, ipaddr, location, coords)
{
	this.original = original;
	this.url = url;
	this.hostname = hostname;
	this.ipaddr = ipaddr;
	this.location = location;
	this.coords = coords;

	this.update = function()
	{
		const prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(null);
		var stringBundle = document.getElementById('hostipfox-string-bundle');
		var content = [];

		if(prefs.getBoolPref("hostipfox.options.show_url") && this.url != null)
			content.push(stringBundle.getString('url_label') + ': ' + this.url);

		if(prefs.getBoolPref("hostipfox.options.show_hostname") && this.hostname != null)
			content.push(stringBundle.getString('host_label') + ': ' + this.hostname);

		if(prefs.getBoolPref("hostipfox.options.show_ipaddr") && this.ipaddr != null)
			content.push(stringBundle.getString('ip_label') + ': ' + this.ipaddr);

		if(prefs.getBoolPref("hostipfox.options.show_location") && this.location != null)
			content.push(stringBundle.getString('location_label') + ': ' + this.location);

		if(prefs.getBoolPref("hostipfox.options.show_coords") && this.coords != null)
			content.push(stringBundle.getString('coords_label') + ': ' + this.coords);

		var tooltipStr = content.length ? content.join('\n') : null;
		if (tooltipStr)
		{
			// "replaceMe" is for NS6.2.3
			var node = document.getElementById('aHTMLTooltip') || document.getElementById('replaceMe');

			if(prefs.getBoolPref("hostipfox.options.show_original") && original != null && original != '')
				tooltipStr = original + '\n' + tooltipStr;

			node.removeAttribute('label');
			node.setAttribute('label', tooltipStr);
			return true;
		}

		return false;
	};

	this.getLocation = function(ipaddr)
	{
		try
		{
			var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
			var api_key = oPrefs.getCharPref("hostipfox.options.api_key")

			var self = this;
			var xmlHttp = new XMLHttpRequest();
			var xmlUrl = 'http://api.hostip.info/?ip=' + ipaddr;

			xmlHttp.open("GET", xmlUrl, true);
			xmlHttp.setRequestHeader("X-Hostip-API-Version", "1.1");
			xmlHttp.setRequestHeader("X-Hostip-API-Key", api_key);

			xmlHttp.onreadystatechange=function()
			{
				if (xmlHttp.readyState==4)
				{
					xmlDoc = xmlHttp.responseXML;
					self.location = '(unknown)';
					self.coords = '(unknown)';

					var gmlNS = "http://www.opengis.net/gml";
					var hostipEl = xmlDoc.getElementsByTagName("Hostip").item(0);
					var countryName = '';
					var cityName = '';
					for(i=0; i < hostipEl.childNodes.length; i++)
					{
						node = hostipEl.childNodes.item(i);
						switch(node.nodeName)
						{
							case "countryAbbrev":
								countryName = node.firstChild.nodeValue;
							break;
							case "gml:name":
								cityName = node.firstChild.nodeValue;
							break;
							case "ipLocation":
								self.coords = node.childNodes.item(1).childNodes.item(1).childNodes.item(1).firstChild.nodeValue;
							break;
						}
					}

					if(cityName != '')
						self.location = cityName;

					if(countryName != '')
						self.location += ', ' + countryName;

					self.update();
				}
			}
			xmlHttp.send(null);
		}
		catch(e)
		{
			alert(e);
		}
	};
}


