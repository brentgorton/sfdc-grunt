var grunt = require('grunt');
var util = require('../../../util.js');
var parser = require('xml2json');
var pd = require('pretty-data').pd;
var helper = require('../../../code.js');

grunt.registerTask('sfdc-wipe-components', function(){
	var src = util.const.undeploy.metadata;
	var output = util.const.undeploy.target + 'wipe-code-components/';
	helper.components.wipe(src, output);
	/*
	grunt.file.expand(src + 'components/*.component').forEach(function(filename){
		var componentName = filename.replace(src + 'components/', '').replace('.component','');
		var metadata = grunt.file.read(filename + '-meta.xml');
		grunt.file.write(output + 'components/' + componentName + '.component', '<apex:component></apex:component>');
		grunt.file.write(output + 'components/' + componentName + '.component-meta.xml', metadata);
	});
	*/
	grunt.file.write(output + 'package.xml', util.generatePackageXml([
		{ name : 'ApexComponent', members : ['*'] }]));
	grunt.task.run(util.deploySFDC(output));
});

grunt.registerTask('sfdc-delete-components', function(){
	var output = util.const.undeploy.target + 'delete-code-components/';
	grunt.file.write(output + 'package.xml', util.generatePackageXml([]))
	grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([helper.components.delete()]));
	grunt.task.run(
		util.deploySFDC(output)
	)
	/*
	var src = util.const.undeploy.metadata;
	var output = util.const.undeploy.target + 'delete-code-components/';
	var members = [];
	grunt.file.expand(src + 'components/*.component').forEach(function(filename){
		var componentName = filename.replace(src + 'components/', '').replace('.component','');
		members[members.length] = componentName;
	});
	grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
	grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
		{ name : 'ApexComponent', members : members }]));
	grunt.task.run(util.deploySFDC(output));
	*/
});


