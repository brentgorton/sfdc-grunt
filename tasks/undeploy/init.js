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

	grunt.loadNpmTasks('grunt-ant-sfdc-purge');
}