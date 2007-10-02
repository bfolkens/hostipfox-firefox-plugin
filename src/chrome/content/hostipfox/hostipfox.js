function hostipfox_enable() {
}

function hostipfox_disable() {
}

function hostipfox_parse_response(xmlDoc) {
	var location = '(unknown)';
	var coords = '(unknown)';

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
				coords = node.childNodes.item(1).childNodes.item(1).childNodes.item(1).firstChild.nodeValue;
			break;
		}
	}

	if(cityName != '')
		location = cityName;

	if(countryName != '')
		location += ', ' + countryName;
		
	return({ location: location, coords: coords, cityName: cityName, countryName: countryName });
}

function hostipfox_getLocation(ipaddr, update_function) {
	try
	{
		var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
		var api_key = oPrefs.getCharPref("hostipfox.options.api_key");

		var xmlHttp = new XMLHttpRequest();
		var xmlUrl = 'http://api.hostip.info/?ip=' + ipaddr;
		
		xmlHttp.open("GET", xmlUrl, true);
		xmlHttp.setRequestHeader("X-Hostip-API-Version", "1.1");
		xmlHttp.setRequestHeader("X-Hostip-API-Key", api_key);

		xmlHttp.onreadystatechange=function()
		{
			if (xmlHttp.readyState==4)
			{
        var hostip_response = hostipfox_parse_response(xmlHttp.responseXML);
      	update_function(hostip_response);
			}
		}
		xmlHttp.send(null);
	}
	catch(e)
	{
		alert(e);
	}
}

function hostipfox_init() {
	if('__hostipfox__FillInHTMLTooltip' in window) return;
	const prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(null);

	var originalFillInHTMLTooltip = window.FillInHTMLTooltip;
	window.__hostipfox__FillInHTMLTooltip = originalFillInHTMLTooltip;

	const dnsService = Components.classes['@mozilla.org/network/dns-service;1'].getService(Components.interfaces.nsIDNSService)

	const nsISupportsString = ('nsISupportsWString' in Components.interfaces) ? Components.interfaces.nsISupportsWString : Components.interfaces.nsISupportsString;

	window.FillInHTMLTooltip = function(elem)
	{
		var retval = false;

		if (!elem ||
			elem.namespaceURI == 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul')
			return false;

		try {
			if (elem) {
				while (elem && (elem.nodeType != Node.ELEMENT_NODE || !elem.attributes.length))
					elem = elem.parentNode;

				if (!elem) return false;

				var attrlist = null;
				try {
					attrlist = prefs.getBoolPref('browser.chrome.tooltips.use_attrlist') ? prefs.getComplexValue('browser.chrome.tooltips.attrlist', nsISupportsString).data : null ;
				}
				catch(ex) {
				}

				if (attrlist) {
					attrlist = attrlist.split('|');
					for (var i in attrlist) {
						if (attrlist[i] && elem.getAttribute(attrlist[i]))
							alttooltiptext.push('['+attrlist[i]+']: '+elem.getAttribute(attrlist[i]));
					}
				}
				else if (
					!elem.ownerDocument.contentType.match(/^text\/html\//) &&
					( ('href' in elem && elem.href) || ('src' in elem && elem.src) )
					)
				{
					// We have a valid link (with href in it)
					var url = elem.href;

					// ... or we have a src tag (img)
					if(!url)
					{
						url = elem.src;
					}

					if(url)
					{
						if(url.length > 40)
						{
							url = url.substring(0, 37) + '...';
						}

						if(url.substring(0, 4) == 'http')
						{
							var original = '';
							if (elem.title)
							{
								original = elem.title;
							}
							else if (elem.label)
							{
								original = elem.label;
							}
							else if (elem.alt)
							{
								original = elem.alt;
							}

							var hostname = elem.hostname ? elem.hostname : Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(url, null, null).host;
							var ipaddr = dnsService.resolve(hostname, false).getNextAddrAsString();

							var tooltip = new hostipfox_Tooltip(original, url, hostname, ipaddr, 'loading...');
							retval = tooltip.update();
							tooltip.refresh_location(ipaddr);
						}
					}
				}
			}
		}
		catch(e) {
		}

		if(!retval) return originalFillInHTMLTooltip(elem);
		else return true;
	};
}

