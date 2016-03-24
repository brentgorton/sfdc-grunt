var grunt = require('grunt');
var util = require('./util.js');
var parser = require('xml2json');
var pd = require('pretty-data').pd;

var Code = {
	apex : {
		delete : function(){
			return Code.generic.delete('ApexClass', util.const.undeploy.metadata, 'classes', 'cls');
		},
		wipe : function(src, target){
			return Code.generic.wipe('ApexClass', 'public class !NAME{ }', src, target, 'classes', 'cls');
		}
	},
	app : {
		delete : function(){
			return Code.generic.delete('CustomApplication', util.const.undeploy.metadata, 'applications', 'app', ['Force_com']);
		}
	},
	fieldupdates : {
		delete : function(){
			var src = util.const.undeploy.metadata;
			return { name : 'WorkflowFieldUpdate', members : Code.generic.getElements('Workflow','fieldUpdates', src, 'workflows', 'workflow') };
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
			return Code.generic.delete('ApexComponent', util.const.undeploy.metadata, 'components', 'component');
		},
		wipe : function(src, target){
			grunt.log.writeln('wiping components');
			return Code.generic.wipe('ApexComponent', '<apex:component></apex:component>', src, target, 'components', 'component');
		}
	},
	objects : {
		getSObjectList : function(){

		},
		wipeDependencies : function(src, output){
			//var src = util.const.undeploy.metadata;
			//var output = util.const.undeploy.target + 'wipe-object-dependencies/';
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
	permissionsets : {
		wipe : function(src, target){
			return Code.generic.wipe('PermissionSet',
				'<?xml version="1.0" encoding="UTF-8"?><PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata"></PermissionSet>',
				src, target, 'permissionsets', 'permissionset');
		}
	},
	quickactions : {
		delete : function(){
			var src = util.const.undeploy.metadata;
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
			return Code.generic.delete('StaticResource', util.const.undeploy.metadata, 'staticresources', 'resource');
		}
	},
	tabs : {
		delete : function(){
			return Code.generic.delete('CustomTab', util.const.undeploy.metadata, 'tabs', 'tab');
		}
	},
	triggers : {
		delete : function(){
			return Code.generic.delete('ApexTrigger', util.const.undeploy.metadata, 'triggers', 'trigger');
		}
	},
	visualforce : {
		delete : function(){
			return Code.generic.delete('ApexPage', util.const.undeploy.metadata, 'pages', 'page');
		},
		wipe : function(src, target){
			return Code.generic.wipe('ApexPage', '<apex:page></apex:page>', src, target, 'pages', 'page');
		}
	},
	workflows : {
		delete : function(){
			var src = util.const.undeploy.metadata;
			var workflows = [];
			return { name : 'WorkflowRule', members : Code.generic.getElements('Workflow','rules', src, 'workflows', 'workflow') };
		}
	}

}

module.exports = Code;