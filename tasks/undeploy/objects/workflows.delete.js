/*var grunt = require('grunt');
var util = require('../../../util.js');*/
var parser = require('xml2json');
var pd = require('pretty-data').pd;
var helper = require('../../../code.js');

module.exports = function(grunt, util){
	grunt.registerTask('sfdc-delete-object-workflows', function(){
		var output = util.const.undeploy.target + 'delete-object-workflows/';
		/*
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'delete-object-workflows/';
		var workflows = [];
		var fieldUpdates = [];
		grunt.file.expand(src + 'workflows/*.workflow').forEach(function(filename){
			if(filename.replace(src + 'workflows/','').replace('.workflow','').indexOf('__c') > 0){
				var objectName = filename.replace(src + 'workflows/','').replace('.workflow','');
				var workflowContent = parser.toJson(grunt.file.read(filename), { object : true });
				workflowContent = workflowContent.Workflow;
				if(workflowContent.rules != null){
					if(workflowContent.rules.length != null){
						for(var i = 0; i < workflowContent.rules.length; i++){
							workflows[workflows.length] = objectName + '.' + workflowContent.rules[i].fullName;
						}
					}else{
						workflows[workflows.length] = objectName + '.' + workflowContent.rules.fullName;
					}
				}
				if(workflowContent.fieldUpdates != null){
					if(workflowContent.fieldUpdates.length != null){
						for(var i = 0; i < workflowContent.fieldUpdates.length; i++){
							fieldUpdates[fieldUpdates.length] = objectName + '.' + workflowContent.fieldUpdates[i].fullName;
						}
					}else{
						fieldUpdates[fieldUpdates.length] = objectName + '.' + workflowContent.rules.fullName;
					}
				}
			}
		})

		var deploy = grunt.config.get('antdeploy') || {};
		var tasks = [];
		if(workflows.length > 0){
			grunt.file.write(output + 'workflows/package.xml', util.generatePackageXml([]));
			grunt.file.write(output + 'workflows/destructiveChanges.xml', util.generatePackageXml([{ name : 'WorkflowRule', members : workflows }]));
			deploy.workflows = {
				options : {
							root : output + 'workflows/',
							existingPackage : true
						}
			};
			tasks[tasks.length] = 'antdeploy:workflows';
		}
		if(fieldUpdates.length > 0){
			grunt.file.write(output + 'fieldUpdates/package.xml', util.generatePackageXml([]));
			grunt.file.write(output + 'fieldUpdates/destructiveChanges.xml', util.generatePackageXml([{ name : 'WorkflowFieldUpdate', members : fieldUpdates }]));
			deploy.fieldUpdates = {
				options : {
							root : output + 'fieldUpdates/',
							existingPackage : true
						}
			};
			tasks[tasks.length] = 'antdeploy:fieldUpdates';
		}
		grunt.config.set('antdeploy', deploy);
		if(tasks.length > 0){
			grunt.task.run(tasks);
		}*/
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([ helper.fieldupdates.delete()]));
		grunt.task.run(util.deploySFDC(output));
	});
}