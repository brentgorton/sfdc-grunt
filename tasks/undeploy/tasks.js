var grunt = require('grunt');
module.exports = [
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