var grunt = require('grunt');
module.exports = [
	'clean:undeploy',
	'sfdc-undeploy-init',
	'wipe-code',
	'delete-code',
	'sfdc-delete-object-rollups',
	'sfdc-delete-object-workflows',
	'sfdc-standardobjects-delete',
	'sfdc-delete-objects',
	'delete-code-final'
];