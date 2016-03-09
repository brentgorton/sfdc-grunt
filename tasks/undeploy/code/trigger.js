var grunt = require('grunt');
var util = require('../../../util.js');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

module.exports = function(){
	grunt.registerTask('sfdc-wipe-trigger', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'wipe-code-triggers/';
		grunt.file.expand(src + 'triggers/*.trigger').forEach(function(filename){
			var triggerName = filename.replace(src + 'triggers/', '').replace('.trigger','');
			var metadata = grunt.file.read(filename + '-meta.xml');
			var triggerContent = grunt.file.read(filename);
			triggerContent = triggerContent.substring(triggerContent.indexOf('trigger ' + triggerName));
			grunt.file.write(output + 'triggers/' + triggerName + '.trigger', triggerContent.substring(0,triggerContent.indexOf('(')) + '(before insert)\{\}');
			grunt.file.write(output + 'triggers/' + triggerName + '.trigger-meta.xml', 
				'<?xml version="1.0" encoding="UTF-8"?>\n' +
				'<ApexTrigger xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
				'\t<apiVersion>31.0</apiVersion>\n' +
				'\t<status>Inactive</status>\n' +
				'</ApexTrigger>');
		});
		grunt.file.write(output + 'package.xml', util.generatePackageXml([
				{ name : 'ApexTrigger', members : ['*'] }
		]));
		grunt.task.run(util.deploySFDC(output));
	});

	grunt.registerTask('sfdc-delete-trigger', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'delete-code-triggers/';
		var triggers = [];
		grunt.file.expand(src + 'triggers/*.trigger').forEach(function(filename){
			
			var triggerName = filename.replace(src + 'triggers/', '').replace('.trigger','');
			triggers[triggers.length] = triggerName;
		});
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([{ name : 'ApexTrigger' , members : triggers }]));
		grunt.task.run(util.deploySFDC(output));
	});
}