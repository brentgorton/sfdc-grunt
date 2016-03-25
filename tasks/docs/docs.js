var grunt = require('grunt');
var util = require('../../util.js');
modules.export = function(){
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
			cwd : 'apexdoc/ApexDocumentation/',
			src : 'apexdoc/ApexDocumentation/*',
			dest : 'apexdoc/src/staticresources/apexdoc.resource',
			compression : 'DEFLATE',
			base64 : true
		}
		grunt.config.set('zip', config);
		config = grunt.config.get('clean') || {}
		config.apexdoc = ['apexdoc'];
		grunt.config.set('clean', config);
		grunt.file.write('apexdoc/src/staticresources/apexdoc.resource-meta.xml', '<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">\n' +
			'<cacheControl>Public</cacheControl>\n' +
	    	'<contentType>application/zip</contentType>\n' +
	    	'<description>Apex documentation</description>\n' +
		'</StaticResource>');
		grunt.file.write('apexdoc/src/package.xml', util.generatePackageXml([{ members : ['*'], name : 'StaticResource' }]));
		grunt.task.run(['exec:buildDocs', 'zip:apexdoc', util.deploySFDC('apexdoc/src/', false)]);
	})
}