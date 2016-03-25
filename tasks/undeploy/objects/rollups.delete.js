/*var grunt = require('grunt');
var util = require('../../../util.js');*/
var parser = require('xml2json');
var pd = require('pretty-data').pd;


module.exports = function(grunt, util){
	grunt.registerTask('sfdc-delete-object-rollups', function(){
		var src = util.const.undeploy.metadata;
		var output = util.const.undeploy.target + 'delete-object-rollups/';
		grunt.log.writeln('Deleting Rollups');
		// Remove rollups
		var objects = {};

		grunt.file.expand(src + 'objects/*.*').forEach(function(filename){
			var result;
			var objectName = filename.replace(src + 'objects/', '').replace('.object','');
			var object = parser.toJson(grunt.file.read(filename), { reversible : true, object : true });
			//var filename = filename.replace('.object.ignore', '.object') + '.ignore';
			var customObject = object.CustomObject;
			if(customObject.fields != null){
				for(var i = 0; i < customObject.fields.length; i++){
					if(customObject.fields[i].type.$t == 'MasterDetail'){
						if(objects[objectName] == null){
							objects[objectName] = {};
						}
						objects[objectName].dependentUpon = customObject.fields[i].referenceTo.$t;
					}
					if(customObject.fields[i].type.$t == 'Summary'){
						if(objects[objectName] == null){
							objects[objectName] = {};
						}
						if(objects[objectName].fields == null){
							objects[objectName].fields = [];
						}
						objects[objectName].fields[objects[objectName].fields.length] = objectName + '.' + customObject.fields[i].fullName.$t;
					}
				}
			}
		});
		
		var deploy = grunt.config.get('antdeploy') || {};
		var index = 0;
		var gruntTasks = [];
		
		var recursiveProcess = function(){
			grunt.log.writeln('recursive call');
			var toDelete = [];
			var hasMore = false;
			var isAdded = false;
			for(var key in objects){
				if(objects.hasOwnProperty(key)){
					if(objects[key].fields == null){
						delete objects[key];
					}else{
						if(objects[key].dependentUpon != null && objects[objects[key].dependentUpon] != null){
							hasMore = true;
							grunt.log.writeln(key + ' dependent upon ' + objects[key].dependentUpon)
						}else{
							for(var i = 0; i < objects[key].fields.length; i++){
								toDelete[toDelete.length] = objects[key].fields[i];
							}
							delete objects[key];
							isAdded = true;
						}
					}
				}
			}
			grunt.log.writeln(JSON.stringify(toDelete));
			if(isAdded){
				grunt.file.write(output + index + '/package.xml', util.generatePackageXml([]));
				grunt.file.write(output + index + '/destructiveChanges.xml', util.generatePackageXml([{ name : 'CustomField', members : toDelete }]));
				gruntTasks[gruntTasks.length] = 'antdeploy:rollup' + index;
				deploy['rollup' + index] = {
					options : {
						root : output + index,
						existingPackage : true
					}
				}
			}
			index++;
			if(hasMore){
				recursiveProcess();
			}
			
		}
		recursiveProcess();
		grunt.config.set('antdeploy', deploy);
		grunt.task.run(gruntTasks);
	});
}