var grunt = require('grunt');
var status = require('node-status');
var util = require('../util.js');
var undeployTasks = [
	'clean:undeploy',
	'sfdc-undeploy-init',
	'sfdc-wipe-code',
	'sfdc-delete-code',
	'sfdc-delete-object-rollups',
	'sfdc-delete-object-workflows',
	'sfdc-standardobjects-delete',
	'sfdc-delete-objects',
	'sfdc-delete-code-final'
];
require('./undeploy/init.js')();
require('./packaging/init.js')();
require('./docs/docs.js')();
module.exports = function(){
	var cleanConfig = grunt.config.get('clean') || {};
	cleanConfig.undeploy = [util.const.undeploy.root];
	grunt.config.set('clean', cleanConfig);
	grunt.registerTask('sfdc-undeploy', undeployTasks);
	grunt.registerTask('sfdc-rebuild', ['sfdc-undeploy', 'sfdc-deploy', 'clean:undeploy']);
	grunt.registerTask('sfdc-rebuild-test', ['sfdc-undeploy', 'sfdc-deploy-test', 'clean:undeploy']);

	grunt.registerTask('sfdc-deploy', function(){
		grunt.task.run(util.deploySFDC('src/'));
	});

	grunt.registerTask('sfdc-deploy-test', function(){
		grunt.task.run(util.deploySFDC('src/', true));
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-wget');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-anon-tasks');
}