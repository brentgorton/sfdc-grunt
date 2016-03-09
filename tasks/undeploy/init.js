var grunt = require('grunt');
var util = require('../../util.js');
var status = require('node-status');
require('./app/app.js')();
require('./app/tab.js')();
require('./code/apex.wipe.js')();
require('./code/component.js')();
require('./code/staticresources.js')();
require('./code/trigger.js')();
require('./code/visualforce.js')();
require('./objects/dependencies.wipe.js')();
require('./objects/objects.delete.js')();
require('./objects/rollups.delete.js')();
require('./objects/standardObjects.delete.js')();
require('./objects/workflows.delete.js')();
require('./security/permissionsets.wipe.js')();

/*
grunt.util.hooker.hook(grunt.log, 'write', {
	pre : function(value){
		try{
			status.console().log(value.toString());
		}catch(err){}
		return grunt.util.hooker.preempt({
			write : function(){},
			ok : function(){},
			err : function(){},
			warn : function(){},
			error : function(){},
			fail : function(){},
			success : function(){}
		});
	}
});  
grunt.util.hooker.hook(grunt.log, 'writeln', {
	pre : function(value){
		try{
			status.console().log(value.toString());
		}catch(err){}
		return grunt.util.hooker.preempt({
			write : function(){},
			ok : function(){},
			err : function(){},
			warn : function(){},
			error : function(){},
			fail : function(){},
			success : function(){}
		});
	}
}); 
*/ 
module.exports = function(){
grunt.registerTask('sfdc-undeploy-init', function(){
	grunt.task.run(util.retrieveSFDC(util.const.undeploy.metadata));
});

grunt.loadNpmTasks('grunt-ant-sfdc');
}