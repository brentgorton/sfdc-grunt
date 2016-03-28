var grunt = require('grunt');
var util = require('../../util.js');
var metadata = require('../../metadata.js');
module.exports = function(){
	grunt.registerTask('sfdc-packaging-cleanup', function(){
		grunt.task.run([util.retrieveSFDC(util.const.undeploy.metadata), 'sfdc-packaging-destructive']);
	});

	grunt.registerTask('sfdc-packaging-destructive', function(){
		grunt.file.write('src/destructiveChanges.xml', util.generatePackageXml(metadata.packaging.generateDestructive(util.const.undeploy.metadata, 'src/')));
		/*
		var types = [{ path : 'classes', ext : 'cls', type : 'ApexClass' },
					 { path : 'pages', ext : 'page', type : 'ApexPage' },
					 { path : 'components', ext : 'component', type : 'ApexComponent' },
					 { path : 'triggers', ext : 'trigger', type : 'ApexTrigger' }
					];
		var metadata = [];
		for(var i = 0; i < types.length; i++){
			var type = types[i];
			var toDelete = [];
			grunt.file.expand(util.const.undeploy.metadata + type.path + '/*.' + type.ext, function(filename){
				if(grunt.file.exists(filename.replace(util.const.undeploy.metadata, 'src/'))){

				}else{
					toDelete[toDelete.length] = filename.replace('.' + type.ext,'');
				}
			});
			if(toDelete.length > 0){
				metadata[metadata.length] = { name : type.type, members : toDelete };
			}
		}
		*/
	});

}