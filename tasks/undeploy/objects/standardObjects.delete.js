var grunt = require('grunt');
var util = require('../../../util.js');
var parser = require('xml2json');
var pd = require('pretty-data').pd;
var standardObjectFields = {
	FieldSet : {
		User : ['Record_Details']
	},
	ValidationRule : {
		Case : ['One_Project_Phase_or_Task']
	},
	CustomField : {
		Case : ['Project_Phase__c', 'Project__c', 'Project_Task__c', 'Worked_Hours__c'],
		User : ['User.Sorting_Hash__c', 'User.Allocatable__c']
	}

};

grunt.registerTask('sfdc-standardobjects-prep', function(){
	var packageXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
	'<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n';
	var objectsMap = {};
	var pkg = {
		customobject : [],
		fieldset : [],
		validationrule : []
	};
	var objectsXml = '';
	var fieldsetsXml = '';
	var validationRulesXml = '';
	// Build Package.xml
	if(standardObjectFields.CustomField != null){
		for(var objectName in standardObjectFields.CustomField){
			if(standardObjectFields.CustomField.hasOwnProperty(objectName)){
				if(objectsMap[objectName] == null){
					pkg.customobject[pkg.customobject.length] = objectName;
				}
			}
		}
	}
	if(standardObjectFields.FieldSet != null){
		for(var key in standardObjectFields.FieldSet){
			if(standardObjectFields.FieldSet.hasOwnProperty(key)){
				if(objectsMap[key] == null){
					if(objectsMap[key] == null){
						pkg.customobject[pkg.customobject.length] = key;
					}
					pkg.fieldset = ['*'];
				}
			}
		}
	}
	if(standardObjectFields.ValidationRule != null){
		for(var key in standardObjectFields.ValidationRule){
			if(standardObjectFields.ValidationRule.hasOwnProperty(key)){
				if(objectsMap[key] == null){
					if(objectsMap[key] == null){
						pkg.customobject[pkg.customobject.length] = key;
					}
					pkg.validationrule = ['*'];
				}
			}
		}
	}
	var output = util.const.undeploy.target + 'delete-standardobject-customizations/verify/';
	grunt.task.run([util.retrieveSFDC(output, pkg)]);
});

grunt.registerTask('sfdc-standardobjects-process', function(){
	var src = util.const.undeploy.target + 'delete-standardobject-customizations/verify/';
	var output = util.const.undeploy.target + 'delete-standardobject-customizations/';
	var customFields = [];
	var fieldsets = [];
	var validationRules = [];
	grunt.file.expand(src + 'objects/*.*').forEach(function(filename){
		var objectName = filename.replace(src + 'objects/', '').replace('.object','');
		var object = parser.toJson(grunt.file.read(filename), { object : true });
		object = object.CustomObject;


		if(object.fields != null && standardObjectFields.CustomField[objectName] != null){
			if(object.fields.length == null){
				object.fields = [object.fields];
			}
			for(var z = 0; z < object.fields.length; z++){
				var fieldName = object.fields[z].fullName;
				for(var i = 0; i < standardObjectFields.CustomField[objectName].length; i++){
					if(standardObjectFields.CustomField[objectName][i] == fieldName){
						customFields[customFields.length] = objectName + '.' + fieldName;
					}
				}
			}
		}

		if(object.fieldSets && standardObjectFields.FieldSet[objectName] != null){
			if(object.fieldSets.length == null){
				object.fieldSets = [object.fieldSets];
			}
			for(var z = 0; z < object.fieldSets.length; z++){
				var fieldsetName = object.fieldSets[z].fullName;
				for(var i = 0; i < standardObjectFields.FieldSet[objectName].length; i++){
					if(standardObjectFields.FieldSet[objectName][i] == fieldsetName){
						fieldsets[fieldsets.length] = objectName + '.' + fieldsetName;
					}
				}
			}
		}
		if(object.validationRules && standardObjectFields.ValidationRule[objectName] != null){
			if(object.validationRules.length == null){
				object.validationRules = [object.validationRules];
			}
			for(var z = 0; z < object.validationRules.length; z++){
				var validationRuleName = object.validationRules[z].fullName;
				for(var i = 0; i < standardObjectFields.ValidationRule[objectName].length; i++){
					if(standardObjectFields.ValidationRule[objectName][i] == validationRuleName){
						validationRules[validationRules.length] = objectName + '.' + validationRuleName;
					}
				}
			}
		}
	});

	if(customFields.length > 0 || fieldsets.length > 0 || validationRules.length > 0){
		var packageXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n';
		if(customFields.length > 0){
			packageXml += '<types>\n';
			for(var i = 0; i < customFields.length; i++){
				packageXml += '<members>' + customFields[i] + '</members>';
			}
			packageXml += '<name>CustomField</name>\n</types>\n';
		}
		if(fieldsets.length > 0){
			packageXml += '<types>\n';
			for(var i = 0; i < fieldsets.length; i++){
				packageXml += '<members>' + fieldsets[i] + '</members>';
			}
			packageXml += '<name>FieldSet</name>\n</types>\n';
		}
		if(validationRules.length > 0){
			packageXml += '<types>\n';
			for(var i = 0; i < validationRules.length; i++){
				packageXml += '<members>' + validationRules[i] + '</members>';
			}
			packageXml += '<name>ValidationRule</name>\n</types>\n';
		}
		packageXml += '</Package>';
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
		grunt.file.write(output + 'destructiveChanges.xml', packageXml);
		grunt.task.run(util.deploySFDC(output));
	}

	
});

grunt.registerTask('sfdc-standardobjects-delete', function(){
	grunt.task.run(['sfdc-standardobjects-prep', 'sfdc-standardobjects-process']);
	/*
	var src = util.const.undeploy.metadata;
	var output = util.const.undeploy.target + 'delete-standardobject-customizations/';
	grunt.log.writeln('\nDeleting Objects'['grey'].bold);
	var fieldsets = [];
	if(standardObjectFields.FieldSet){
		for(var key in standardObjectFields.FieldSet){
			if(standardObjectFields.FieldSet.hasOwnProperty(key)){
				for(var i = 0; i < standardObjectFields.FieldSet[key].length; i++)
				fieldsets[fieldsets.length] = key + '.' + standardObjectFields.FieldSet[key][i];
			}
		}
	}
	var validationrules = [];
	if(standardObjectFields.ValidationRule){
		for(var key in standardObjectFields.ValidationRule){
			if(standardObjectFields.ValidationRule.hasOwnProperty(key)){
				for(var i = 0; i < standardObjectFields.ValidationRule[key].length; i++){
					validationrules[validationrules.length] = key + '.' + standardObjectFields.ValidationRule[key][i];
				}
			}
		}
	}
	grunt.file.write(output + '0/package.xml', util.generatePackageXml([]));
	grunt.file.write(output + '0/destructiveChanges.xml', util.generatePackageXml([
		{ name : 'ValidationRule', members : validationrules },
		{ name : 'FieldSet', members : fieldsets }
	]));

	var members = standardObjectFields.CustomField;
	grunt.file.write(output + '1/package.xml', util.generatePackageXml([]));
	grunt.file.write(output + '1/destructiveChanges.xml', util.generatePackageXml([{ name : 'CustomField', members : members }]));
	var deploy = grunt.config.get('antdeploy') || {};
	deploy.standard0 = {
		options : {
					root : output + '0',
					existingPackage : true
				}
	};
	deploy.standard1 = {
		options : {
					root : output + '1',
					existingPackage : true
				}
	};
	grunt.config.set('antdeploy', deploy);
	grunt.task.run(['antdeploy:standard0', 'antdeploy:standard1']);
	*/

});