var grunt = require('grunt');
var util = require('../../../util.js');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

grunt.registerTask('sfdc-delete-tab', function(){
	var src = util.const.undeploy.metadata;
	var output = util.const.undeploy.target + 'delete-app-tab/';
	var members = [];
	grunt.file.expand(src + 'tabs/*.tab').forEach(function(filename){
		var tabName = filename.replace(src + 'tabs/', '').replace('.tab','');
		if(tabName.indexOf('__c') <= 0){
			members[members.length] = tabName;
		}
	});
	grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
	grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
		{ name : 'CustomTab', members : members }
	]));
	grunt.task.run(util.deploySFDC(output));
});