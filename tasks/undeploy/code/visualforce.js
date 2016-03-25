var grunt = require('grunt');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

module.exports = function(util){
	grunt.registerTask('sfdc-wipe-visualforce', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'wipe-code-visualforce/';
		util.metadata.visualforce.wipe(src, output);
		grunt.file.write(output + 'package.xml', util.generatePackageXml([
			{ name : 'ApexPage', members : ['*'] }
		]));
		grunt.task.run(util.deploySFDC(output));
	});

	grunt.registerTask('sfdc-delete-visualforce', function(){
		var output = util.const.undeploy.target + 'delete-code-visualforce/';
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]))
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([util.metadata.visualforce.delete()]));
		grunt.task.run(
			util.deploySFDC(output)
		)
	});

	grunt.registerTask('sfdc-delete-quick-actions', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'delete-code-quick-actions/';
		var pages = {};
		var members = [];
		grunt.file.expand(src + 'pages/*.page').forEach(function(filename){
			var pageName = filename.replace(src + 'pages/', '').replace('.page','');
			pages[pageName] = true;
		});

		grunt.file.expand(src + 'quickActions/*.quickAction').forEach(function(filename){
			var quickActionName = filename.replace(src + 'quickActions/', '').replace('.quickAction','');
			var quickAction = parser.toJson(grunt.file.read(filename), { object : true }).QuickAction;

			if(quickAction.page != null && pages[quickAction.page] != null){
				members[members.length] = quickActionName;
			}
		});
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]));
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
				{ name : 'QuickAction', members : members }
		]));
		grunt.task.run(util.deploySFDC(output));

	})
}