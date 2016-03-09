var grunt = require('grunt');
var util = require('../../../util.js');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

module.exports = function(){
	grunt.registerTask('sfdc-delete-app', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'delete-app-app/';
		var members = [];
		grunt.file.expand(src + 'applications/*.app').forEach(function(filename){
			var appName = filename.replace(src + 'applications/', '').replace('.app','');
			if(appName != 'Force_com'){
				members[members.length] = appName;
			}
		});
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
				{ name : 'CustomApplication', members : members }
		]));
		grunt.task.run(util.deploySFDC(output));
	});
}