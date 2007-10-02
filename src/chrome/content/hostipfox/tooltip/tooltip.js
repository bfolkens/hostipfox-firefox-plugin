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

	this.refresh_location = function(ipaddr)
	{
	  var self = this;
	  hostipfox_getLocation(ipaddr, function(hostip_response) {
			self.location = hostip_response.location;
			self.coords = hostip_response.coords;
			self.update();
	  });
	};
}


