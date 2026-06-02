import { getExtensionInfo } from '../../src/parsers/extension.js';
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { identifyPackageType } from '../../src/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(__dirname, '../fixtures/extension/basic.ts');
const fixtureSource = ts.createSourceFile(
    fixturePath,
    fs.readFileSync(fixturePath, 'utf-8'),
    ts.ScriptTarget.Latest,
    true
);

describe('getExtensionInfo', () => {
    it('extracts name', () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode);
        expect(info.name).toBe('test-extension');
    });

    it('extracts class JSDoc as description', () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode);
        expect(info.description).toBe('A test jsPsych extension.');
    });

    it('extracts initializeParameters with types, descriptions, and defaults', () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode);
        expect(info.initializeParameters.single.type).toBe('number');
        expect(info.initializeParameters.single.description).toBe('Single-line description.');
        expect(info.initializeParameters.single.default).toBe('0');
        expect(info.initializeParameters.double_double.type).toBe('string');
        expect(info.initializeParameters.double_double.description).toBe('Multi-line description. It has two lines for a parameter. Woo.');
        expect(info.initializeParameters.double_double.default).toBe('"hello hello"');
    });

    it('extracts array flag on initializeParameters', () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode);
        expect(info.initializeParameters.list_of_stimuli.array).toBe(true);
        expect(info.initializeParameters.list_of_stimuli.type).toBe('string');
        expect(info.initializeParameters.list_of_stimuli.default).toBe('["stim1.png", "stim2.png"]');
    });

    it('extracts onStartParameters with object type', () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode);
        expect(info.onStartParameters.nested_object.type).toBe('{ nested_param: number }');
        expect(info.onStartParameters.nested_object.description).toBe("Let's try an object.");
        expect(info.onStartParameters.nested_object.default).toBe('{ nested_param: 42 }');
    });

    it('extracts onLoadParameters with nested descriptions and defaults', () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode);
        expect(info.onLoadParameters.grid.description).toBe('Maybe a grid.');
        expect(info.onLoadParameters.grid.default).toBeUndefined();
        expect(info.onLoadParameters.grid.nested).toBeDefined();
        expect(info.onLoadParameters.grid.nested!.x.description).toBe('The x coordinate.');
        expect(info.onLoadParameters.grid.nested!.x.default).toBe('3');
        expect(info.onLoadParameters.grid.nested!.y.description).toBe('The y coordinate.');
        expect(info.onLoadParameters.grid.nested!.y.default).toBe('3');
    });

    it('extracts onFinishParameters with nested array type', () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode);
        expect(info.onFinishParameters.boolean_param.array).toBe(true);
        expect(info.onFinishParameters.boolean_param.type).toBe('boolean[]');
        expect(info.onFinishParameters.boolean_param.description).toBe('And a boolean grid.');
        expect(info.onFinishParameters.boolean_param.default).toBe('[[true, false], [false, true]]');
    });

    it('extracts data parameters', () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode);
        expect(info.data.data_param.type).toBe('ParameterType.FLOAT');
        expect(info.data.data_param.description).toBe('Data parameter description.');
        expect(info.data.double_data.type).toBe('ParameterType.BOOL');
        expect(info.data.double_data.description).toBe('Multi-line data parameter description. It has two lines for data.');
    });

    it('extracts nested data parameters', () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode);
        expect(info.data.grid.type).toBe('ParameterType.COMPLEX');
        expect(info.data.grid.description).toBe("Now let's have a grid.");
        expect(info.data.grid.nested).toBeDefined();
    });
});
