var grunt = require('grunt');
var Util = {
	login : {
		user : '',
		pw : '',
		token : ''
	},
	getSFDCUser : function(){
		if(process.env.sfuser == null){
			Util.login = grunt.file.readJSON('.config/login.json');
		}else{
			Util.login.user = process.env.sfuser;
		}
		return Util.login.user;
	},
	getSFDCPass : function(){
		if(process.env.sfuser == null){
			Util.login = grunt.file.readJSON('.config/login.json');
		}else{
			Util.login.pw = process.env.sfpass;
		}
		return Util.login.pw;
	},
	getSFDCToken : function(){
		if(process.env.sfuser == null){
			Util.login = grunt.file.readJSON('.config/login.json');
		}else{
			Util.login.token = process.env.sftoken;
		}
		return Util.login.token;
	},
	const : {
		undeploy : {
			root : 'undeploy/',
			metadata : 'undeploy/metadata/',
			target : 'undeploy/steps/'
		}
	},
	generatePackageXml : function(types){
		var response = '<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n';
		for(var i = 0; i < types.length; i++){
			response += '\t<types>\n';
			for(var z = 0; z < types[i].members.length; z++){
				response += '\t\t<members>' + types[i].members[z] + '</members>\n';
			}
			response += '\t\t<name>' + types[i].name + '</name>\n' +
	    				'\t</types>\n';
		}
		response += '\t<version>31.0</version>\n</Package>';
		return response;
	},
	retrieveSFDC : function(path, pkg){
		if(pkg == undefined){
			pkg = {
				staticresource : ['*'],
				apexclass : ['*'],
				apexpage : ['*'],
				apexcomponent : ['*'],
				apextrigger : ['*'],
				customobject : ['*'],
				customtab : ['*'],
				customapplication : ['*'],
				fieldset : ['*'],
				permissionset : ['*'],
				quickactions : ['*'],
				workflow : ['*']
			}
		}
		var options = {}
		options.options = { root : path };
		options.pkg = pkg;
		var config = grunt.config.get('antretrieve') || {};
		config.options = {
				serverurl : 'https://login.salesforce.com',
				user : 'brent.gorton+brentdev1@cloudcoach.enterprise',
				pass : 'Trojans.116v7vUnpJ43KsAgxJSmQxUqD7z',
				maxPoll : 200,
				pollWaitMillis : 10000
			};
		var taskName = 'dynamic';
		config[taskName] = options;
		grunt.config.set('antretrieve', config);
		return 'antretrieve:' + taskName;
	},
	deploySFDC : function(path, runTests, existingPackage){
		var config = grunt.config.get('antdeploy') || {};
		config.options = {
				serverurl : 'https://login.salesforce.com',
				user : Util.getSFDCUser(),
				pass : Util.getSFDCPass() + Util.getSFDCToken(),
				maxPoll : 200,
				pollWaitMillis : 10000
		};
		config.dynamic = {
			options : {
				root : path,
				existingPackage : (existingPackage == undefined || existingPackage),
				runAllTests : (runTests == undefined ? false : runTests)
			}
		}
		grunt.config.set('antdeploy', config);
		return 'antdeploy:dynamic';
	}
}

module.exports = Util;