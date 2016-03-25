var grunt = require('grunt');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

module.exports = function(util){
	grunt.registerTask('sfdc-wipe-permissionsets', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'wipe-security-permissionsets/';
		grunt.log.writeln('\nWiping Permission Sets'['grey'].bold);
		grunt.file.expand(src + 'permissionsets/*.permissionset').forEach(function(filename){
			var permissionsetName = filename.replace(src + 'permissionsets/', '').replace('.permissionset','');
			grunt.file.write(output + 'permissionsets/' + permissionsetName + '.permissionset', 
				'<?xml version="1.0" encoding="UTF-8"?>\n' +
				'<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">\n</PermissionSet>'
			);
		});
		grunt.file.write(output + 'package.xml', util.generatePackageXml([
			{ name : 'PermissionSet', members : ['*'] }]));
		grunt.task.run(util.deploySFDC(output));
	});
}