require('module-alias/register');
require('mocha');

const fs = require('fs');
const path = require('path');
const {expect} = require('chai');

const {render} = require('@unstatic-io/site-renderer/lib/renderer');

function loadTestCases() {
    const basePath = path.join(__dirname, 'test-cases');
    const caseNames = fs.readdirSync(basePath);
    return caseNames.map(name => {
        const filenames = {
            input: path.join(basePath, name, 'input.md'),
            output: path.join(basePath, name, 'output.html'),
            data: path.join(basePath, name, 'data.json')
        };
        const input = fs.readFileSync(filenames.input, 'utf8');
        const output = fs.readFileSync(filenames.output, 'utf8');
        
        let exists = false;
        try {
            fs.statSync(filenames.data);
            exists = true;
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }

        const result = {name, input, output};

        if (exists) {
            result.data = require(filenames.data);
        }

        return result;
    });
}

const testCases = loadTestCases();

describe('renderer', () => {
    describe(`escape`)

    describe('render', () => {
        function testCase({input, output: expected, name, data}) {
            it(`should correctly render output in case ${name}`, async () => {
                const actual = await render({input, data});
                expect(actual).to.equal(expected);
            });
        }

        testCases.forEach(testCase);
    });
});
