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
	grunt.task.run(util.deploySFDC('src/', true));
});

grunt.registerTask('sfdc-docs-generate', function(){
	grunt.task.run([util.getApexdoc, 'sfdc-docs-build'])
});

grunt.registerTask('sfdc-docs-build', function(){
	var config = grunt.config.get('exec') || {}
	config.buildDocs = 'curl -s https://github.com/SalesforceFoundation/ApexDoc/releases/download/1.1.5/apexdoc.jar | grep -Eo \'(http|https)://[^"]+\' > .tmp.url' +
					   ' && mkdir -p lib' +
					   ' && sed \'s/\\&amp;/\\&/g\' .tmp.url' +
					   ' | xargs curl -o lib/apexdoc.jar && rm .tmp.url' +
					   ' && java -jar lib/apexdoc.jar -s \'src/classes\' -t \'apexdoc\' -p \'global;public;private;testmethod;webService\''
	grunt.config.set('exec', config);

	config = grunt.config.get('zip') || {};
	config.apexdoc = {
		cwd : 'doc/ApexDocumentation/',
		src : 'doc/ApexDocumentation/*',
		dest : 'apexdoc/src/staticresources/apexdoc.resource',
		compression : 'DEFLATE',
		base64 : true
	}
	grunt.config.set('zip', config);
	config = grunt.config.get('clean') || {}
	config.apexdoc = ['apexdoc', 'doc'];
	grunt.file.write('apexdoc/src/staticresources/apexdoc.resource-meta.xml', '<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
		'<cacheControl>Public</cacheControl>\n' +
    	'<contentType>application/zip</contentType>\n' +
    	'<description>jquery 1.10.2</description>\n' +
	'</StaticResource>');
	grunt.task.run(['exec:buildDocs', 'zip:apexdoc', util.deploySFDC('apexdoc/', false, false), 'clean:apexdoc']);
})


grunt.registerTask('wipe-code', function(){
	var src = util.const.undeploy.metadata;
	var output = util.const.undeploy.target + 'wipe-code/';
	grunt.file.write(output + 'package.xml', util.generatePackageXml([
		helper.components.wipe(src, output),
		helper.visualforce.wipe(src, output),
		helper.permissionsets.wipe(src, output),
		helper.objects.wipeDependencies(src, output)
	]));
	grunt.log.writeln('wrote package.xml');
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
grunt.loadNpmTasks('grunt-wget');
grunt.loadNpmTasks('grunt-exec');
}