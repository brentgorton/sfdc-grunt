var grunt = require('grunt');
var metadata = require('./metadata.js');
var constants = require('./const.js');
var Util = {
	metadata : metadata,
	login : {
		user : '',
		pw : '',
		token : ''
	},
	getSFDCUser : function(){
		try{
			Util.login = grunt.file.readJSON('.config/login.json');
			return Util.login.user;
		}catch(err){
			return '';
		}
	},
	getSFDCPass : function(){
		//if(process.env.sfuser == null){
		try{
			Util.login = grunt.file.readJSON('.config/login.json');
			return Util.login.pw;
		}catch(err){
			return '';
		}
	},
	getSFDCToken : function(){
		try{
			Util.login = grunt.file.readJSON('.config/login.json');
			return Util.login.token;
		}catch(err){
			return '';
		}
	},
	const : constants,
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
				user : Util.getSFDCUser(),
				pass : Util.getSFDCPass() + Util.getSFDCToken(),
				maxPoll : 200,
				pollWaitMillis : 10000
			};
		var taskName = 'dynamic';
		config[taskName] = options;
		grunt.config.set('antretrieve', config);
		return 'antretrieve:' + taskName;
	},
	deploySFDC : function(path, runTests, existingPackage, login){
		var config = grunt.config.get('antdeploy') || {};
		config.options = {
				serverurl : 'https://login.salesforce.com',
				user : Util.getSFDCUser(),
				pass : Util.getSFDCPass() + Util.getSFDCToken(),
				maxPoll : 200,
				pollWaitMillis : 10000
		};
		var deployName = 'deploy_0';
		for(var i = 0; i < 1000; i++){
			if(!config.hasOwnProperty('deploy_' + i)){
				deployName = 'deploy_' + i;
				break;
			}
		}

		var testsToRun = null;
		if(runTests){
			testsToRun = [];
			var testSearchConfig = grunt.config.get('search') || {};
			testSearchConfig.tests = {
			    files: {
					src: [path + "classes/*.cls"]
			    },
			    options: {
					searchString: /@isTest|testMethod/g,
					logFile: "tmp/testresults.json"
			    }
			}
			grunt.config.set('search', testSearchConfig);
			grunt.task.run('search:tests');
			
			var testClasses = grunt.file.readJSON('tmp/testresults.json');
			for(var key in testClasses.results){
				if(testClasses.results.hasOwnProperty(key)){
					testsToRun[testsToRun.length] = key.replace('.cls','').replace(path + 'classes/','');
					grunt.log.writeln(key.replace('.cls','').replace(path + 'classes/',''));
				}
			}
		}

		config[deployName] = {
			options : {
				root : path,
				existingPackage : (existingPackage == undefined || existingPackage),
				runAllTests : (runTests == undefined ? false : runTests),
				serverurl : 'https://login.salesforce.com',
				user : Util.getSFDCUser(),
				pass : Util.getSFDCPass() + Util.getSFDCToken(),
				maxPoll : 200,
				pollWaitMillis : 10000,
				tests : testsToRun
			}
		}
		grunt.config.set('antdeploy', config);
		return 'antdeploy:' + deployName;
	},
	installPackage : function(namespace, version, user, pass, runTests){
		version = version.replace('v', '');
		var config = grunt.config.get('antdeploy') || {};
		config.options = {
				serverurl : 'https://login.salesforce.com',
				user : Util.getSFDCUser(),
				pass : Util.getSFDCPass() + Util.getSFDCToken(),
				maxPoll : 200,
				pollWaitMillis : 10000
		};
		var deployName = 'deploy_0';
		for(var i = 0; i < 1000; i++){
			if(!config.hasOwnProperty('deploy_' + i)){
				deployName = 'deploy_' + i;
				break;
			}
		}
		var path = Util.const.install.root + namespace + '/' + version + '/';
		grunt.file.write(path + 'package.xml','<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata"><types><members>*</members><name>InstalledPackage</name></types><version>32.0</version></Package>');
		grunt.file.write(path + 'installedPackages/' + namespace + '.installedPackage', '<?xml version="1.0" encoding="UTF-8"?><InstalledPackage xmlns="http://soap.sforce.com/2006/04/metadata"><versionNumber>' + version + '</versionNumber></InstalledPackage>');
		config[deployName] = {
			options : {
				root : path,
				existingPackage : true,
				runAllTests : ((runTests == 'true' || runTests == true) ? true : false),
				serverurl : 'https://login.salesforce.com',
				user : user,
				pass : pass,
				maxPoll : 400,
				pollWaitMillis : 10000
			}
		}
		grunt.config.set('antdeploy', config);
		return 'antdeploy:' + deployName;
	}
}

module.exports = Util;
