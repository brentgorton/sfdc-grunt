var grunt = require('grunt');
var util = require('../../util.js');
var status = require('node-status');
grunt.task.loadTasks('tasks/undeploy/objects');
grunt.task.loadTasks('tasks/undeploy/code');
grunt.task.loadTasks('tasks/undeploy/security');
grunt.task.loadTasks('tasks/undeploy/app');

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

grunt.registerTask('sfdc-undeploy-init', function(){
	grunt.task.run(util.retrieveSFDC(util.const.undeploy.metadata));
});

grunt.loadNpmTasks('grunt-ant-sfdc');