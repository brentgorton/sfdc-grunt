var grunt = require('grunt');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

module.exports = function(util){
	grunt.registerTask('sfdc-wipe-components', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'wipe-code-components/';
		util.metadata.components.wipe(src, output);
		grunt.file.write(output + 'package.xml', util.generatePackageXml([
			{ name : 'ApexComponent', members : ['*'] }]));
		grunt.task.run(util.deploySFDC(output));
	});

	grunt.registerTask('sfdc-delete-components', function(){
		var output = util.const.undeploy.target + 'delete-code-components/';
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]))
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([util.metadata.components.delete()]));
		grunt.task.run(
			util.deploySFDC(output)
		)
	});
}


