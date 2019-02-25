const _ = require('lodash');
const uuid = require('uuid');
const showdown = require('showdown');
const jsYaml = require('js-yaml');

/**
 * Escapes the code sections in a given Markdown input with intermediate replacements
 */
async function escapeCodeSections(input) {
    let result = {codeSections: {}, output: input};

    if (input) {
        const pattern = /(`{3}[a-z]*\n[\s\S]*?\n`{3})/g;

        result.output = input.replace(pattern, match => {
            const id = uuid.v4();
            result.codeSections[id] = match;
            const sectionKey = `codeSections[${id}]`;
            return '${' + sectionKey + '}';
        });
    }

    return result;
}

/**
 * Extracts YAML-formatted metadata from the header section of a given Markdown input
 */
async function extractMetadata(input) {
    let result = {metadata: {}, output: input};

    if (input) {
        const pattern = /^\-{3}([a-z]*\n[\s\S]*?\n)\-{3}/g;
        
        result.output = input.replace(pattern, (match, capture) => {
            const yaml = (capture || '').trim();
            result.metadata = jsYaml.safeLoad(yaml);
            return '';
        })
    }

    return result;
}

/**
 * Interpolates the code sections, metadata, and any arbitrary data on a given Markdown input.
 * The integrity of each type of data will be retained, and it's possible to intermix metadata
 * with arbitrary data by nesting them into each other.
 */
async function interpolateDataKeys({input, data = {}, codeSections = {}, metadata = {}, maxRecursions = 1000}) {
    async function doInterpolate(current, attempt, lookup) {
        if (attempt > maxRecursions) {
            return current;
        }

        const pattern = /\$\{([\@\d\w\.\[\]\-]*)\}/g;

        let replacements = [];
        let match;
        while (match = pattern.exec(current)) {
            const key = match[1];
            if (!_.has(lookup, key)) {
                continue;
            }
            replacements.push({key: match[0], value: _.get(lookup, key)});
        }

        if (replacements.length < 1) {
            return current;
        }

        const next = replacements.reduce((acc, {key, value}) => acc.replace(key, value), current);

        return doInterpolate(next, attempt + 1, lookup);;
    }

    const interpolated = await doInterpolate(input, 0, {...data, '@metadata': metadata});
    return await doInterpolate(interpolated, 0, {codeSections});
}

async function render({input, data = {}}) {
    const converter = new showdown.Converter();
    converter.setFlavor('github');
    
    const {output: withoutMetadata, metadata} = await extractMetadata(input);
    const {output: escapedInput, codeSections} = await escapeCodeSections(withoutMetadata);
    const interpolatedInput = await interpolateDataKeys({input: escapedInput, data, codeSections, metadata});
    const withDollarSigns = interpolatedInput.replace(/\&dollar\;/g, '$');

    const output = converter.makeHtml(withDollarSigns);
    return output;
}

module.exports = {
    escapeCodeSections,
    render
};
