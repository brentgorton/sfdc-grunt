var grunt = require('grunt');
//var util = require('../../../util.js');*/
var parser = require('xml2json');
var pd = require('pretty-data').pd;

module.exports = function(util){
	grunt.registerTask('sfdc-delete-objects', function(src, output){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'delete-objects/';
		grunt.log.writeln('\nDeleting Objects'['grey'].bold);
		var objects = [];
		var fields = [];
		grunt.file.expand(src + 'objects/*.*').forEach(function(filename){
			var objectName = filename.replace(src + 'objects/','').replace('.object','');
			var objectData = parser.toJson(grunt.file.read(filename), {object : true, reversible : true});
			objectData = objectData.CustomObject;
			if(objectName.indexOf('__c') > 0){
				objects[objects.length] = objectName;
				if(objectData.fields != null){
					for(var i = 0; i < objectData.fields.length; i++){
						if(objectData.fields[i].type.$t != 'Summary'){
							fields[fields.length] = objectName + '.' + objectData.fields[i].fullName.$t;
						}
					}
				}
			}
		});
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
			{ name : 'CustomObject', members : objects },
			{ name : 'CustomField', members : fields }
		]));
		grunt.task.run(util.deploySFDC(output));
	});
}