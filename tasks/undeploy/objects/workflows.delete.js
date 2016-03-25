var grunt = require('grunt');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

module.exports = function(util){
	grunt.registerTask('sfdc-delete-object-workflows', function(){
		var output = util.const.undeploy.target + 'delete-object-workflows/';
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([ util.metadata.fieldupdates.delete()]));
		grunt.task.run(util.deploySFDC(output));
	});
}