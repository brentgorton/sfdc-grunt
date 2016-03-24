var grunt = require('grunt');
var util = require('../../../util.js');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

module.exports = function(){
	grunt.registerTask('sfdc-delete-apex', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'delete-code-apex/';
		var members = [];
		grunt.file.expand(src + 'classes/*.cls').forEach(function(filename){
			var className = filename.replace(src + 'classes/', '').replace('.cls','');
			var metadata = grunt.file.read(filename + '-meta.xml');
			members[members.length] = className;
		});
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
			{ name : 'ApexClass', members : members }]));

		grunt.task.run(util.deploySFDC(output));
	});
}