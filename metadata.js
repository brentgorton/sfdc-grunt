var grunt = require('grunt');
var constants = require('./const.js');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

var Metadata = {
	apex : {
		delete : function(){
			grunt.log.writeln('Deleting Apex ')
			return Metadata.generic.delete('ApexClass', constants.undeploy.metadata, 'classes', 'cls');
		},
		wipe : function(src, target){
			return Metadata.generic.wipe('ApexClass', 'public class !NAME{ }', src, target, 'classes', 'cls');
		}
	},
	app : {
		delete : function(){
			return Metadata.generic.delete('CustomApplication', constants.undeploy.metadata, 'applications', 'app', ['Force_com']);
		}
	},
	fieldupdates : {
		delete : function(){
			var src = constants.undeploy.metadata;
			return { name : 'WorkflowFieldUpdate', members : Metadata.generic.getElements('Workflow','fieldUpdates', src, 'workflows', 'workflow') };
		}
	},
	generic : {
		delete : function(type, src, dir, extension, ignore){
			var members = [];
			grunt.file.expand(src + dir + '/*.' + extension).forEach(function(filename){
				var componentName = filename.replace(src + dir + '/', '').replace('.' + extension,'');
				var found = false;
				if(ignore != null){
					if(ignore.length == null){
						ignore = [ignore];
					}
					for(var i = 0; i < ignore.length; i++){
						if(ignore[i] == componentName){
							found = true;
						}
					}
				}
				if(!found){
					members[members.length] = componentName;
				}
			})
			return { name : type, members : members }
		},
		wipe : function(type, body, src, target, dir, extension){
			grunt.file.expand(src + dir + '/*.' + extension).forEach(function(filename){
				var componentName = filename.replace(src + dir + '/', '').replace('.' + extension,'');
				
				grunt.file.write(target + dir + '/' + componentName + '.' + extension, body.replace('!NAME', componentName));
				try{
					var metadata = grunt.file.read(filename + '-meta.xml');
					grunt.file.write(target + dir + '/' + componentName + '.' + extension + '-meta.xml', metadata);
				}catch(err){}
			});
			return { name : type, members : ['*'] };
		},
		getElements : function(object, type, path, dir, extension, enforceCustomObject){
			var elements = [];
			enforceCustomObject = (enforceCustomObject == null ? true : enforceCustomObject);
			grunt.file.expand(path + dir + '/*.' + extension).forEach(function(filename){
				var objectName = filename.replace(path + dir + '/','').replace('.' + extension,'');
				if( !enforceCustomObject || objectName.indexOf('__c') > 0 ){
					var objectContent = parser.toJson(grunt.file.read(filename), { object : true });
					objectContent = objectContent[object];
					if(objectContent[type] != null){
						if(objectContent[type].length != null){
							for(var i = 0; i < objectContent[type].length; i++){
								elements[elements.length] = objectName + '.' + objectContent[type][i].fullName;
							}
						}else{
							elements[elements.length] = objectName + '.' + objectContent[type].fullName;
						}
					}
				}
			});
			return elements;
		}
	},
	components : {
		delete : function(){
			return Metadata.generic.delete('ApexComponent', constants.undeploy.metadata, 'components', 'component');
		},
		wipe : function(src, target){
			grunt.log.writeln('wiping components');
			return Metadata.generic.wipe('ApexComponent', '<apex:component></apex:component>', src, target, 'components', 'component');
		}
	},
	objects : {
		getSObjectList : function(){

		},
		wipeDependencies : function(src, output){
			//var src = constants.undeploy.metadata;
			//var output = constants.undeploy.target + 'wipe-object-dependencies/';
			// Remove formulas
			grunt.log.writeln('Wiping All Object Dependencies (Formulas, Overrides, FieldSets)'['grey'].bold);
			var members = [];
			grunt.file.expand(src + 'objects/*.*').forEach(function(filename){
				var result;
				var object = parser.toJson(grunt.file.read(filename), { reversible : true, object : true });
				var customObject = object.CustomObject;
				if(customObject.fields != null){
					for(var i = 0; i< customObject.fields.length; i++){
						if(customObject.fields[i].formula != null){
							try{
								var blankValue = '';
								switch(customObject.fields[i].type.$t){
									case 'Date' : blankValue = 'DATE(1990,1,1)';
											break;
									case 'Number' : blankValue = 0;
											break;
									case 'Text' : blankValue = '\'blank\'';
											break;
									case 'Percent' : blankValue = 0;
											break;
									case 'Checkbox' : blankValue = 'true';
											break;
								}
								customObject.fields[i].formula.$t = blankValue;
								grunt.log.writeln('Wiped '['green'] + customObject.fullName.$t + '.' + customObject.fields[i].fullName.$t)
							}catch(err){}
						}
					}
				}
				var hasFieldset = false;
				if(customObject.fieldSets != null){
					hasFieldset = true;
					if(customObject.fieldSets.length != null){
						for(var i = 0; i < customObject.fieldSets.length; i++){
							delete customObject.fieldSets[i].availableFields;
							delete customObject.fieldSets[i].displayedFields;
						}
					}else{
						try{
							delete customObject.fieldSets.availableFields;
							delete customObject.fieldSets.displayedFields;
						}catch(err){}
					}
				}

				if(customObject.actionOverrides != null){
					for(var i = 0; i < customObject.actionOverrides.length; i++){
						customObject.actionOverrides[i].type.$t = 'Default';
						delete customObject.actionOverrides[i].content;
						delete customObject.actionOverrides[i].skipRecordTypeSelect;
					}
				}
				result = JSON.stringify(object);
				result = parser.toXml(result, { sanitize : false });
				grunt.file.write(filename.replace(src, output), pd.xml('<?xml version="1.0" encoding="UTF-8"?>' + result));
				members[members.length] = filename.replace(src + 'objects/', '').replace('.object', '');
			});
			return { name : 'CustomObject', members : members };
			//grunt.file.write(output + 'package.xml', util.generatePackageXml([{ name : 'CustomObject', members : members }]));
			//grunt.task.run(util.deploySFDC(output));
		}
	},
	packaging : {
		generateDestructive : function(src, target){
			var types = [{ path : 'classes', ext : 'cls', type : 'ApexClass' },
						 { path : 'pages', ext : 'page', type : 'ApexPage' },
						 { path : 'components', ext : 'component', type : 'ApexComponent' },
						 { path : 'triggers', ext : 'trigger', type : 'ApexTrigger' }
						];
			var metadata = [];
			for(var i = 0; i < types.length; i++){
				var type = types[i];
				var toDelete = [];
				grunt.log.writeln(src + type.path + '/*.' + type.ext);
				grunt.file.expand(src + type.path + '/*.' + type.ext).forEach(function(filename){
					grunt.log.writeln(filename);
					if(grunt.file.exists(filename.replace(src, target))){

					}else{
						grunt.log.writeln('Found file to delete ' + filename.replace('.' + type.ext, ''));
						toDelete[toDelete.length] = filename.replace(src + type.path + '/', '').replace('.' + type.ext,'');
					}
				});
				if(toDelete.length > 0){
					metadata[metadata.length] = { name : type.type, members : toDelete };
				}
			}
			return metadata;
		}
	},
	permissionsets : {
		wipe : function(src, target){
			return Metadata.generic.wipe('PermissionSet',
				'<?xml version="1.0" encoding="UTF-8"?><PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata"></PermissionSet>',
				src, target, 'permissionsets', 'permissionset');
		}
	},
	quickactions : {
		delete : function(){
			var src = constants.undeploy.metadata;
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
			return { name : 'QuickAction', members : members };
		}
	},
	staticresources : {
		delete : function(){
			return Metadata.generic.delete('StaticResource', constants.undeploy.metadata, 'staticresources', 'resource');
		}
	},
	tabs : {
		delete : function(){
			return Metadata.generic.delete('CustomTab', constants.undeploy.metadata, 'tabs', 'tab');
		}
	},
	triggers : {
		delete : function(){
			return Metadata.generic.delete('ApexTrigger', constants.undeploy.metadata, 'triggers', 'trigger');
		}
	},
	visualforce : {
		delete : function(){
			return Metadata.generic.delete('ApexPage', constants.undeploy.metadata, 'pages', 'page');
		},
		wipe : function(src, target){
			return Metadata.generic.wipe('ApexPage', '<apex:page></apex:page>', src, target, 'pages', 'page');
		}
	},
	workflows : {
		delete : function(){
			var src = constants.undeploy.metadata;
			var workflows = [];
			return { name : 'WorkflowRule', members : Metadata.generic.getElements('Workflow','rules', src, 'workflows', 'workflow') };
		}
	}

}

module.exports = Metadata;