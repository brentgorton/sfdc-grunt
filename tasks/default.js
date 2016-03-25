var grunt = require('grunt');
var status = require('node-status');
var util = require('../util.js');
var undeployTasks = require('./undeploy/tasks.js');
require('./undeploy/init.js')();
require('./docs/docs.js')();
module.exports = function(){
	var cleanConfig = grunt.config.get('clean') || {};
	cleanConfig.undeploy = [util.const.undeploy.root];
	grunt.config.set('clean', cleanConfig);
	grunt.registerTask('sfdc-undeploy', undeployTasks);
	grunt.registerTask('sfdc-rebuild', ['sfdc-undeploy', 'sfdc-deploy', 'clean:undeploy']);
	grunt.registerTask('sfdc-rebuild-test', ['sfdc-undeploy', /*'sfdc-deploy', */'sfdc-deploy-test', 'clean:undeploy']);

	grunt.registerTask('sfdc-deploy', function(){
		grunt.task.run(util.deploySFDC('src/'));
	});

	grunt.registerTask('sfdc-deploy-test', function(){
		grunt.task.run(util.deploySFDC('src/', true));
	});




	grunt.registerTask('wipe-code', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'wipe-code/';
		grunt.file.write(output + 'package.xml', util.generatePackageXml([
			util.metadata.components.wipe(src, output),
			util.metadata.visualforce.wipe(src, output),
			util.metadata.permissionsets.wipe(src, output),
			util.metadata.objects.wipeDependencies(src, output)
		]));
		grunt.log.writeln('wrote package.xml');
		grunt.task.run(util.deploySFDC(output));
	});

	grunt.registerTask('delete-code', function(){
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

	grunt.registerTask('delete-code-final', function(){
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
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-wget');
	grunt.loadNpmTasks('grunt-exec');
}