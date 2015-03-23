/** @jsx React.DOM */

var React = require("react");
var StepAdderPlaceHolder = require('./step-adder-placeholder');
var StepAdder = require('./step-adder');
var Router = require('react-router');


var Button = require('react-bootstrap/Button');
var ButtonGroup = require('react-bootstrap/ButtonGroup');
var Grid = require('react-bootstrap/Grid');
var Row = require('react-bootstrap/Row');
var Col = require('react-bootstrap/Col');

var ListGroup = require('react-bootstrap/ListGroup');
var ListGroupItem = require('react-bootstrap/ListGroupItem');

var EditorPresenter = require('./../../lib/editor-presenter');
var loader = require('./component-loader');

var SpecOutline = require('./spec-outline');

var Icons = require('./../icons');

var Running = Icons['running'];
var Persisting = require('./persisting');
var SpecResultHeader = require('./spec-result-header');



var CommandButton = React.createClass({
	render: function(){
		var self = this;

		var presenter = this.props.presenter;

		var onclick = presenter[this.props.method].bind(presenter);

		var Icon = Icons[this.props.icon];

		return (
			<Button 
				id={this.props.id}
				title={this.props.title} 
				disabled={this.props.disabled} 
				onClick={onclick}><Icon /></Button>

		);
	}
});

var modes = {
	results: {
		buildComponents: spec => spec.buildResults(loader.results)
	},

	editing: {
		buildComponents: spec => spec.editors(loader.editing)
	},

	preview: {
		buildComponents: spec => spec.previews(loader.preview)
	}
}

module.exports = React.createClass({
	mixins: [Router.State],

	// smelly, but oh well
	gotoResults: function(){
		if (this.props.mode != 'results'){
			window.location = '#/spec/results/' + this.state.id;
		}
	},

	getInitialState: function(){
		// yeah, I know this is an "anti-pattern", but it makes
		// isolated testing much easier.
		var id = this.props.id; 
		var mode = this.props.mode || 'editing';

		try {
			var params = this.getParams();
			if (params && params.mode){
				mode = params.mode;
			}

			if (id == null || id == undefined){
				var id = this.getParams().id;
			}
		}
		catch (e){
			console.log('SpecEditor could not read routing urls');
		}


		return {
			components: [],
			outline: {title: 'placeholder', active: true, children: []},
			undoEnabled: false, 
			redoEnabled: false,
			loading: true,
			spec: {name: 'temp'},
			id: id,
			persisting: false,
			lastSaved: null,
			mode: mode,
			header: {hasResults: function(){
				return false;
			}}

		}
	},

	componentDidMount: function(){
		this.presenter = new EditorPresenter(this.state.id);
		this.presenter.activate(modes[this.state.mode], this);
	},

	componentWillUnmount: function(){
		this.presenter.deactivate();
	},

	buildSelector: function(){
		if (this.state.mode != 'editing') return null;

		if (this.state.spec.active){
			return StepAdder({holder: this.state.spec});
		}

		return StepAdderPlaceHolder({holder: this.state.spec.id, text: 'add sections or comments...'});
	},

	render: function(){
		if (this.state.loading){
			return (
				<Grid>
					<Row>
						<div className="center-block">
							<br />
							<br />
							<br />
							<h3><i className="fa fa-spinner fa-2x fa-spin"></i> Loading {this.state.spec.name}...</h3>
						</div>
					</Row>
				</Grid>
			);
		}

		var selector = this.buildSelector();

		var headerClass = "";
		if (this.state.spec.active){
			headerClass = "text-primary";
		}

		var links = [];
		if (this.state.mode != 'editing'){
			var elem = (<ListGroupItem href={'#/spec/editing/' + this.state.id}>Editor</ListGroupItem>);
			links.push(elem);
		}

		if (this.state.mode != 'preview'){
			var elem = (<ListGroupItem href={'#/spec/preview/' + this.state.id}>Preview</ListGroupItem>);
			links.push(elem);
		}

		if (this.state.mode != 'results'){
			var elem = (<ListGroupItem href={'#/spec/results/' + this.state.id}>Results</ListGroupItem>);
			links.push(elem);
		}

		var resultsHeader = null;
		if (this.state.header.hasResults()){
			resultsHeader = (<SpecResultHeader spec={this.state.header} />);
		}

		return (
			<Grid>
				<Row>
					<Col xs={4} md={4}>

						
						<br/>
						<br/>

					    <ListGroup>
					      {links}
					    </ListGroup>


						
						<br/>
						<br/>

						<p>LIFECYCLE WILL BE HERE!</p>
						<p>Retries count</p>
						<p>Tags here</p>
					
						<h4>Outline</h4>
						<SpecOutline outline={this.state.outline} />
					</Col>
					
					<Col xs={8} md={8}>
					    <h3 className={headerClass}>
							{this.state.spec.title}
							<span className="pull-right">
								<ButtonGroup>
									<CommandButton title="Run the specification" presenter={this.presenter} icon="run" method="run" disabled={false}></CommandButton>
									<CommandButton title="Save outstanding changes to the spec" presenter={this.presenter} icon="save" method="save" disabled={!this.state.undoEnabled}></CommandButton>
									<CommandButton title="Undo the last change" id='undo' presenter={this.presenter} icon="undo" method="undo" disabled={!this.state.undoEnabled}></CommandButton>
									<CommandButton title="Redo the previous change" id='redo' presenter={this.presenter} icon="redo" method="redo" disabled={!this.state.redoEnabled}></CommandButton>
								</ButtonGroup>
							</span>
						</h3>

					    <hr />

					    {resultsHeader}

					    <Persisting spec={this.state.spec} lastSaved={this.state.lastSaved} persisting={this.state.persisting}/>

					    {this.state.components}
					    {selector}
					</Col>
				</Row>
			</Grid>
		);
	}
});