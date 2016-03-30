var grunt = require('grunt');
var util = require('../../util.js');
var status = require('node-status');
require('./app/app.js')(util);
require('./app/tab.js')(util);
require('./code/apex.wipe.js')(util);
require('./code/component.js')(util);
require('./code/staticresources.js')(util);
require('./code/trigger.js')(util);
require('./code/visualforce.js')(util);
require('./objects/dependencies.wipe.js')(util);
require('./objects/objects.delete.js')(util);
require('./objects/rollups.delete.js')(util);
require('./objects/standardObjects.delete.js')(util);
require('./objects/workflows.delete.js')(util);
require('./security/permissionsets.wipe.js')(util);

module.exports = function(){
	grunt.registerTask('sfdc-undeploy-init', function(){
		grunt.task.run(util.retrieveSFDC(util.const.undeploy.metadata));
	});

	grunt.registerTask('sfdc-clear-metadata', function(){
		var src = util.const.undeploy.metadata;
		grunt.task
		.run(util.retrieveSFDC(util.const.undeploy.metadata))
		.then(function(){
			var done = this.async();
			grunt.log.writeln('Deleting code components - Stage 1');
			var output = util.const.undeploy.target + 'wipe-code/';
			grunt.file.write(output + 'package.xml', util.generatePackageXml([
				util.metadata.components.wipe(src, output),
				util.metadata.visualforce.wipe(src, output),
				util.metadata.permissionsets.wipe(src, output),
				util.metadata.objects.wipeDependencies(src, output)
			]));
		})
		.run(util.deploySFDC(util.const.undeploy.target + 'wipe-code/'))
		.then(function(){
			output = util.const.undeploy.target + 'delete-code-all/';
			grunt.file.write(output + 'package.xml', util.generatePackageXml([]))
			grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
				util.metadata.apex.delete(),
				util.metadata.triggers.delete(),
				util.metadata.components.delete(),
				util.metadata.app.delete(),
				util.metadata.tabs.delete(),
				util.metadata.quickactions.delete(),
				util.metadata.workflows.delete()
			]));
		})
		.run(util.deploySFDC(util.const.undeploy.target + 'delete-code-all/'));
	});

	grunt.registerTask('sfdc-wipe-code', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'wipe-code/';
		grunt.file.write(output + 'package.xml', util.generatePackageXml([
			util.metadata.components.wipe(src, output),
			util.metadata.visualforce.wipe(src, output),
			util.metadata.permissionsets.wipe(src, output),
			util.metadata.objects.wipeDependencies(src, output)
		]));
		grunt.task.run(util.deploySFDC(output));
	});

	grunt.registerTask('sfdc-delete-code', function(){
		var output = util.const.undeploy.target + 'delete-code-all/';
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]))
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
			util.metadata.apex.delete(),
			util.metadata.triggers.delete(),
			util.metadata.components.delete(),
			util.metadata.app.delete(),
			util.metadata.tabs.delete(),
			util.metadata.quickactions.delete(),
			util.metadata.workflows.delete()
		]));
		grunt.task.run(
			util.deploySFDC(output)
		)
	});

	grunt.registerTask('sfdc-delete-code-final', function(){
		var output = util.const.undeploy.target + 'delete-code-final/';
		grunt.file.write(output + 'package.xml', util.generatePackageXml([]))
		grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
			util.metadata.visualforce.delete(),
			util.metadata.staticresources.delete()
		]));
		grunt.task.run(
			util.deploySFDC(output)
		)
	});
	grunt.loadNpmTasks('grunt-ant-sfdc-purge');
}