var Spec = require('./spec');
var _ = require('lodash');

class Suite{
	constructor(data, parent){
		this.name = data.name;
		this.path = data.path;
		this.parent = parent;

		this.isHierarchy = parent == null || parent == undefined;

		var self = this;

		this.suites = (data.suites || []).map(x => new Suite(x, self));
		this.specs = (data.specs || []).map(x => new Spec(x));
	}

	childSuite(name){
		return _.find(this.suites, x => x.name == name);
	}

	hasAnySpecs(){
		return this.specs.length > 0 || _.any(this.suites, s => s.hasAnySpecs());
	}

	filter(filter){
		var filtered = new Suite(this, null);
		filtered.isHierarchy = this.isHierarchy;
		filtered.specs = this.specs.filter(filter);
		filtered.suites = this.suites
			.map(s => s.filter(filter))
			.filter(x => x.hasAnySpecs());

		return filtered;
	}

	allSpecIds(){
		return this.allSpecs().map(s => s.id);
	}

	summary(){
		var specs = this.allSpecs();

		var totals = {
			total: specs.length,
			acceptance: specs.filter(x => {
				return x.lifecycle == 'Acceptance';
			}).length,

			regression: specs.filter(x => {
				return x.lifecycle == 'Regression';
			}).length,

			success: specs.filter(x => {
				return x.status() == 'success';
			}).length,

			failed: specs.filter(x => {
				return x.status() == 'failed';
			}).length,

			none: specs.filter(x => {
				return x.status() == 'none';
			}).length
		}

		return totals;
	}


	allSpecs(){
		var specs = [];
		var gather = function(suite){
			specs.push(suite.specs);
			suite.suites.forEach(s => gather(s));
		}

		gather(this);

		return _.flatten(specs);
	}
}



module.exports = Suite;