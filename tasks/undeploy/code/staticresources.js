var grunt = require('grunt');
var util = require('../../../util.js');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

module.exports = function(){
	grunt.registerTask('sfdc-delete-staticresources', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'delete-code-staticresources/';
		var members = [];
		grunt.file.expand(src + 'staticresources/*.resource').forEach(function(filename){
			var resourceName = filename.replace(src + 'staticresources/', '').replace('.resource','');
			members[members.length] = resourceName;
		});
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
			{ name : 'StaticResource', members : members }]));
		grunt.task.run(util.deploySFDC(output));
	});
}


