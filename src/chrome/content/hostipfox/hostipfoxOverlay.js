// Original coding by Hiroshi Shimoda
// Popup ALT attributes of IMG (or other) elements
function initHostipfox() {
	if ('__hostipfox__FillInHTMLTooltip' in window) return;

	var originalFillInHTMLTooltip = window.FillInHTMLTooltip;
	window.__hostipfox__FillInHTMLTooltip = originalFillInHTMLTooltip;

	const dnsService = Components.classes['@mozilla.org/network/dns-service;1'].getService(Components.interfaces.nsIDNSService)

	const pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(null);
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
					attrlist = pref.getBoolPref('browser.chrome.tooltips.use_attrlist') ? pref.getComplexValue('browser.chrome.tooltips.attrlist', nsISupportsString).data : null ;
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
						if(url.length > 50)
						{
							url = url.substring(0, 47) + '...';
						}

						if(url.substring(0, 4) == 'http')
						{
							var location = 'loading...';
							var hostname = elem.hostname ? elem.hostname : Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(url, null, null).host;
							var ipaddr = dnsService.resolve(hostname, false).getNextAddrAsString();

							var tooltip = new Tooltip(url, hostname, ipaddr, location);
							retval = tooltip.update();
							tooltip.getLocation(ipaddr);
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
window.addEventListener('load', initHostipfox, false);

function Tooltip(url, hostname, ipaddr, location)
{
	this.url = url;
	this.hostname = hostname;
	this.ipaddr = ipaddr;
	this.location = location;

	this.update = function()
	{
		var alttooltiptext = [];
		var tooltipStr = String('Address: ' + this.url);
		if(this.hostname != null)
		{
			tooltipStr += '\nHost: ' + this.hostname;
		}
		if(this.ipaddr != null)
		{
			tooltipStr += '\nIP: ' + this.ipaddr;
		}
		if(this.location != null)
		{
			tooltipStr += '\nLocation: ' + this.location;
		}

		alttooltiptext.push(tooltipStr);

		alttooltiptext = alttooltiptext.length ? alttooltiptext.join('\n') : null ;
		if (alttooltiptext)
		{
			// "replaceMe" is for NS6.2.3
			var node = document.getElementById('aHTMLTooltip') || document.getElementById('replaceMe');
			node.removeAttribute('label');
			node.setAttribute('label', alttooltiptext);
			return true;
		}

		return false;
	};

	this.getLocation = function(ipaddr)
	{
		try
		{
			var self = this;
			var xmlHttp = new XMLHttpRequest();
			var xmlUrl = 'http://www.hostip.info/api/get.XML?ip=' + ipaddr;
			xmlHttp.open("GET", xmlUrl, true);
			xmlHttp.onreadystatechange=function()
			{
				if (xmlHttp.readyState==4)
				{
					xmlDoc = xmlHttp.responseXML;
					self.location = '(unknown)';

					var gmlNS = "http://www.opengis.net/gml";
					var hostipEl = xmlDoc.getElementsByTagName("Hostip").item(0);
					var countryName = '';
					var cityName = '';
					for(i=0; i < hostipEl.childNodes.length; i++)
					{
						switch(hostipEl.childNodes.item(i).nodeName)
						{
							case "countryAbbrev":
								countryName = hostipEl.childNodes.item(i).firstChild.nodeValue;
							break;
							case "gml:name":
								cityName = hostipEl.childNodes.item(i).firstChild.nodeValue;
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


