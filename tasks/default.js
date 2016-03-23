var grunt = require('grunt');
var status = require('node-status');
var util = require('../util.js')
var helper = require('../code.js');
var undeployTasks = require('./undeploy/tasks.js');
var callbacks = require('../task.callbacks.js');
require('./undeploy/init.js')();

module.exports = function(){
//grunt.task.loadTasks('./tasks/undeploy');
var cleanConfig = grunt.config.get('clean') || {};
cleanConfig.undeploy = [util.const.undeploy.root];
grunt.config.set('clean', cleanConfig);
var globalStatus;

//callbacks(undeployTasks);

status.start({ invert : false, interval : 500 });
grunt.registerTask('sfdc-undeploy', undeployTasks);
grunt.registerTask('sfdc-rebuild', ['sfdc-undeploy', 'sfdc-deploy', 'clean:undeploy']);
grunt.registerTask('sfdc-rebuild-test', ['sfdc-undeploy', /*'sfdc-deploy', */'sfdc-deploy-test', 'clean:undeploy']);

grunt.registerTask('sfdc-deploy', function(){
	grunt.task.run(util.deploySFDC('src/'));
});

grunt.registerTask('sfdc-deploy-test', function(){
	/*
	grunt.file.mkdir(util.const.undeploy + 'tests/');
	grunt.task.run(util.deploySFDC(util.const.undeploy + 'tests/', true));
	*/
	grunt.task.run(util.deploySFDC('src/', true));
});


grunt.registerTask('wipe-code', function(){
	var src = util.const.undeploy.metadata;
	var output = util.const.undeploy.target + 'wipe-code/';
	grunt.file.write(output + 'package.xml', util.generatePackageXml([
		helper.components.wipe(src, output),
		 helper.visualforce.wipe(src, output),
		 helper.permissionsets.wipe(src, output),
		 helper.objects.wipeDependencies(src, output)
	]));
	grunt.task.run(util.deploySFDC(output));
});
grunt.registerTask('delete-code', function(){
	var output = util.const.undeploy.target + 'delete-code-all/';
	grunt.file.write(output + 'package.xml', util.generatePackageXml([]))
	grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
		helper.apex.delete(),
		helper.triggers.delete(),
		helper.components.delete(),
		helper.app.delete(),
		helper.tabs.delete(),
		helper.quickactions.delete(),
		helper.workflows.delete()
	]));
	grunt.task.run(
		util.deploySFDC(output)
	)
});
grunt.registerTask('delete-code-final', function(){
	var output = util.const.undeploy.target + 'delete-code-final/';
	grunt.file.write(output + 'package.xml', util.generatePackageXml([]))
	grunt.file.write(output + 'destructiveChanges.xml', util.generatePackageXml([
		helper.visualforce.delete(),
		helper.staticresources.delete()
	]));
	grunt.task.run(
		util.deploySFDC(output)
	)
});
grunt.loadNpmTasks('grunt-contrib-clean');
}