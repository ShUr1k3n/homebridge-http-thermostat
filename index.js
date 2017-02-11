var Service, Characteristic;
var request = require("request");

	module.exports = function(homebridge){
		Service = homebridge.hap.Service;
		Characteristic = homebridge.hap.Characteristic;
		homebridge.registerAccessory("homebridge-http-thermostat", "Http", HttpThermostate);
	}


	function HttpThermostate(log, config) {
		this.log = log;

		// url info
		this.cur_temperature_url            = config["cur_temperature_url"];
		this.cur_target_temperature_url     = config["cur_target_temperature_url"];
		this.change_target_temperature_url  = config["change_target_temperature_url"];
		this.cur_heat_cool_state_url        = config["cur_heat_cool_state_url"];
		this.change_thermostat_state_url    = config["change_thermostat_state_url"];		
		this.http_method                    = config["http_method"] 	  	 	|| "GET";;
		this.http_brightness_method         = config["http_brightness_method"]  || this.http_method;
		this.username                       = config["username"] 	  	 	 	|| "";
		this.password                       = config["password"] 	  	 	 	|| "";
		this.sendimmediately                = config["sendimmediately"] 	 	|| "";
		this.name                           = config["name"];
	}

	HttpAccessory.prototype = {

	httpRequest: function(url, body, method, username, password, sendimmediately, callback) {
		request({
			url: url,
			body: body,
			method: method,
			rejectUnauthorized: false,
			auth: {
				user: username,
				pass: password,
				sendImmediately: sendimmediately
			}
		},
		function(error, response, body) {
			callback(error, response, body)
		})
	},

	setCurrentHeatingCoolingState: function(newState, callback) {										
		if (!this.change_thermostat_state_url) {
			this.log.warn("Ignoring request; No change_thermostat_state_url defined.");
			callback(new Error("No change_thermostat_state_url url defined."));
			return;
		}
		
		var url = this.change_thermostat_state_url + "/" + newState;				
		this.log("Setting current change_thermostat_state_url state to" + newState);
		
		this.httpRequest(url, "", this.http_method, this.username, this.password, this.sendimmediately, function(error, response, responseBody) {
			if (error) {
				this.log('HTTP set current thermostate state function failed: %s', error.message);
				callback(error);
			} else {
				this.log('HTTP set current thermostate state function succeeded!');
				callback();
			}
		}.bind(this));		
	},
  
	getCurrentHeatingCoolingState: function(callback) {
		if (!this.cur_temperature_url) {
			this.log.warn("Ignoring request; No current temperature url defined.");
			callback(new Error("No current temperature url defined."));
			return;
		}		
		var url = this.cur_temperature_url;
		this.log("Getting Current Temperature");

		this.httpRequest(url, "", "GET", this.username, this.password, this.sendimmediately, function(error, response, responseBody) {
			if (error) {
				this.log('HTTP get current temperature function failed: %s', error.message);
				callback(error);
			} else {			
				var curTempValue = parseFloat(responseBody.replace(/\D/g,""));
				this.log("current temperature is %s", curTempValue);
				callback(null, curTempValue);
			}
		}.bind(this));
	},

	getCurrentTemperature: function(callback) {
		if (!this.cur_temperature_url) {
			this.log.warn("Ignoring request; No current temperature url defined.");
			callback(new Error("No current temperature url defined."));
			return;
		}		
		var url = this.cur_temperature_url;
		this.log("Getting Current Temperature");

		this.httpRequest(url, "", "GET", this.username, this.password, this.sendimmediately, function(error, response, responseBody) {
			if (error) {
				this.log('HTTP get current temperature function failed: %s', error.message);
				callback(error);
			} else {			
				var curTempValue = parseFloat(responseBody.replace(/\D/g,""));
				this.log("current temperature is %s", curTempValue);
				callback(null, curTempValue);
			}
		}.bind(this));
	},

	getTargetTemperature: function(callback) {
		if (!this.cur_target_temperature_url) {
			this.log.warn("Ignoring request; No Target temperature url defined.");
			callback(new Error("No Target temperature url defined."));
			return;
		}		
		var url = this.cur_target_temperature_url;
		this.log("Getting target Temperature");

		this.httpRequest(url, "", "GET", this.username, this.password, this.sendimmediately, function(error, response, responseBody) {
			if (error) {
				this.log('HTTP get target temperature function failed: %s', error.message);
				callback(error);
			} else {			
				var targetTempValue = parseFloat(responseBody.replace(/\D/g,""));
				this.log("target temperature is %s", targetTempValue);
				callback(null, targetTempValue);
			}
		}.bind(this));
	},

	setTargetTemperature: function(newTemperature, callback) {										
		if (!this.change_target_temperature_url) {
			this.log.warn("Ignoring request; No change_target_temperature_url defined.");
			callback(new Error("No change_target_temperature_url url defined."));
			return;
		}
		
		var url = this.change_target_temperature_url + "/" + newState;				
		this.log("Setting target temperature to" + newState);
		
		this.httpRequest(url, "", this.http_method, this.username, this.password, this.sendimmediately, function(error, response, responseBody) {
			if (error) {
				this.log('HTTP set target temperature function failed: %s', error.message);
				callback(error);
			} else {
				this.log('HTTP set target temperature function succeeded!');
				callback();
			}
		}.bind(this));		
	},

	getTemperatureDisplayUnits: function(callback) {
		callback(null, Characteristic.TemperatureDisplayUnits.CELSIUS);
	},

	identify: function(callback) {
		this.log("Identify requested!");
		callback(); // success
	},

	getServices: function() {
		
		var that = this;
		
		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();
	
		informationService
		.setCharacteristic(Characteristic.Manufacturer, "HttpThermostate Manufacturer")
		.setCharacteristic(Characteristic.Model, "HttpThermostate Model")
		.setCharacteristic(Characteristic.SerialNumber, "HttpThermostate Serial Number");
	
		this.thermostatService = new Service.Thermostat(this.name);

		this.thermostatService
		.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
		.on('get', this.getCurrentHeatingCoolingState.bind(this))
		.on('set', this.setCurrentHeatingCoolingState.bind(this))
		.getCharacteristic(Characteristic.TargetHeatingCoolingState)
		.on('get', this.getCurrentHeatingCoolingState.bind(this))
		.on('set', this.setCurrentHeatingCoolingState.bind(this))
		.getCharacteristic(Characteristic.CurrentTemperature)
		.on('get', this.getCurrentTemperature.bind(this))
		.getCharacteristic(Characteristic.TargetTemperature)
		.on('get', this.getTargetTemperature.bind(this))
		.on('set', this.setTargetTemperature.bind(this))
		.getCharacteristic(Characteristic.TemperatureDisplayUnits)
		.on('get', this.getTemperatureDisplayUnits.bind(this));
		// .on('set', this.setTemperatureDisplayUnits.bind(this))
		
		return [this.thermostatService];			
	}
};
