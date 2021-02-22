// Require the dev-dependencies
const chai = require("chai");
const chaiHttp = require("chai-http");
let expect = chai.expect;
let assert = require('chai').assert
const app = require('../../app');
const should = chai.should();
chai.use(chaiHttp);

//Export this to use in multiple files
module.exports = {
	chai,
	app,
	should,
	expect,
	assert
};
