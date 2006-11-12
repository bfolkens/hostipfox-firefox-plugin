function hostipfox_initOptions() {
	var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
		
	document.getElementById("hostipfox.options.show_original").checked = oPrefs.getBoolPref("hostipfox.options.show_original");
	document.getElementById("hostipfox.options.show_url").checked = oPrefs.getBoolPref("hostipfox.options.show_url");
	document.getElementById("hostipfox.options.show_hostname").checked = oPrefs.getBoolPref("hostipfox.options.show_hostname");
	document.getElementById("hostipfox.options.show_ipaddr").checked = oPrefs.getBoolPref("hostipfox.options.show_ipaddr");
	document.getElementById("hostipfox.options.show_location").checked = oPrefs.getBoolPref("hostipfox.options.show_location");
	document.getElementById("hostipfox.options.show_coords").checked = oPrefs.getBoolPref("hostipfox.options.show_coords");
//	document.getElementById("hostipfox.options.api_key").value = oPrefs.getCharPref("hostipfox.options.api_key");
}

function hostipfox_saveOptions() {
	var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");

	oPrefs.setBoolPref("hostipfox.options.show_original", document.getElementById("hostipfox.options.show_original").checked);
	oPrefs.setBoolPref("hostipfox.options.show_url", document.getElementById("hostipfox.options.show_url").checked);
	oPrefs.setBoolPref("hostipfox.options.show_hostname", document.getElementById("hostipfox.options.show_hostname").checked);
	oPrefs.setBoolPref("hostipfox.options.show_ipaddr", document.getElementById("hostipfox.options.show_ipaddr").checked);
	oPrefs.setBoolPref("hostipfox.options.show_location", document.getElementById("hostipfox.options.show_location").checked);
	oPrefs.setBoolPref("hostipfox.options.show_coords", document.getElementById("hostipfox.options.show_coords").checked);
//	oPrefs.setCharPref("hostipfox.options.api_key", document.getElementById("hostipfox.options.api_key").value);
	
	return true;	
}

