var grunt = require('grunt');
//var util = require('../../../util.js');*/
var parser = require('xml2json');
var pd = require('pretty-data').pd;

module.exports = function(util){
	grunt.registerTask('sfdc-wipe-object-dependencies', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'wipe-object-dependencies/';
		// Remove formulas
		grunt.log.writeln('Wiping All Object Dependencies (Formulas, Overrides, FieldSets)'['grey'].bold);
		var members = [];
		grunt.file.expand(src + 'objects/*.*').forEach(function(filename){
			var result;
			var object = parser.toJson(grunt.file.read(filename), { reversible : true, object : true });
			var customObject = object.CustomObject;
			if(customObject.fields != null){
				for(var i = 0; i< customObject.fields.length; i++){
					if(customObject.fields[i].formula != null){
						try{
							var blankValue = '';
							switch(customObject.fields[i].type.$t){
								case 'Date' : blankValue = 'DATE(1990,1,1)';
										break;
								case 'Number' : blankValue = 0;
										break;
								case 'Text' : blankValue = '\'blank\'';
										break;
								case 'Percent' : blankValue = 0;
										break;
								case 'Checkbox' : blankValue = 'true';
										break;
							}
							customObject.fields[i].formula.$t = blankValue;
							grunt.log.writeln('Wiped '['green'] + customObject.fullName.$t + '.' + customObject.fields[i].fullName.$t)
						}catch(err){}
					}
				}
			}
			var hasFieldset = false;
			if(customObject.fieldSets != null){
				hasFieldset = true;
				if(customObject.fieldSets.length != null){
					for(var i = 0; i < customObject.fieldSets.length; i++){
						delete customObject.fieldSets[i].availableFields;
						delete customObject.fieldSets[i].displayedFields;
					}
				}else{
					try{
						delete customObject.fieldSets.availableFields;
						delete customObject.fieldSets.displayedFields;
					}catch(err){}
				}
			}

			if(customObject.actionOverrides != null){
				for(var i = 0; i < customObject.actionOverrides.length; i++){
					customObject.actionOverrides[i].type.$t = 'Default';
					delete customObject.actionOverrides[i].content;
					delete customObject.actionOverrides[i].skipRecordTypeSelect;
				}
			}
			result = JSON.stringify(object);
			result = parser.toXml(result, { sanitize : false });
			grunt.file.write(filename.replace(src, output), pd.xml('<?xml version="1.0" encoding="UTF-8"?>' + result));
			members[members.length] = filename.replace(src + 'objects/', '').replace('.object', '');
		});
		grunt.file.write(output + 'package.xml', util.generatePackageXml([{ name : 'CustomObject', members : members }]));
		grunt.task.run(util.deploySFDC(output));
	});
}