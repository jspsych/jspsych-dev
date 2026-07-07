import { getExtensionInfo, getExtensionInfoAndExamples } from '../../src/parsers/extension.js';
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jest } from '@jest/globals';
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
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode as ts.ClassDeclaration);
        expect(info.name).toBe('test-extension');
    });

    it('extracts class JSDoc as description', () => {
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode as ts.ClassDeclaration);
        expect(info.description).toBe('A test jsPsych extension.');
    });

    it('extracts initializeParameters with types, descriptions, and defaults', () => {
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode as ts.ClassDeclaration);
        expect(info.initializeParameters.single.type).toBe('number');
        expect(info.initializeParameters.single.description).toBe('Single-line description.');
        expect(info.initializeParameters.single.default).toBe('0');
        expect(info.initializeParameters.double_double.type).toBe('string');
        expect(info.initializeParameters.double_double.description).toBe('Multi-line description. It has two lines for a parameter. Woo.');
        expect(info.initializeParameters.double_double.default).toBe('"hello hello"');
    });

    it('extracts array flag on initializeParameters', () => {
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode as ts.ClassDeclaration);
        expect(info.initializeParameters.list_of_stimuli.array).toBe(true);
        expect(info.initializeParameters.list_of_stimuli.type).toBe('string');
        expect(info.initializeParameters.list_of_stimuli.default).toBe('["stim1.png", "stim2.png"]');
    });

    it('extracts onStartParameters with object type', () => {
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode as ts.ClassDeclaration);
        expect(info.onStartParameters.nested_object.type).toBe('{ nested_param: number }');
        expect(info.onStartParameters.nested_object.description).toBe("Let's try an object.");
        expect(info.onStartParameters.nested_object.default).toBe('{ nested_param: 42 }');
    });

    it('extracts onLoadParameters with nested descriptions and defaults', () => {
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode as ts.ClassDeclaration);
        expect(info.onLoadParameters.grid.description).toBe('Maybe a grid.');
        expect(info.onLoadParameters.grid.default).toBeUndefined();
        expect(info.onLoadParameters.grid.nested).toBeDefined();
        expect(info.onLoadParameters.grid.nested!.x.description).toBe('The x coordinate.');
        expect(info.onLoadParameters.grid.nested!.x.default).toBe('3');
        expect(info.onLoadParameters.grid.nested!.y.description).toBe('The y coordinate.');
        expect(info.onLoadParameters.grid.nested!.y.default).toBe('3');
    });

    it('extracts onFinishParameters with nested array type', () => {
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode as ts.ClassDeclaration);
        expect(info.onFinishParameters.boolean_param.array).toBe(true);
        expect(info.onFinishParameters.boolean_param.type).toBe('boolean[]');
        expect(info.onFinishParameters.boolean_param.description).toBe('And a boolean grid.');
        expect(info.onFinishParameters.boolean_param.default).toBe('[[true, false], [false, true]]');
    });

    it('extracts data parameters', () => {
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode as ts.ClassDeclaration);
        expect(info.data.data_param.type).toBe('float');
        expect(info.data.data_param.description).toBe('Data parameter description.');
        expect(info.data.double_data.type).toBe('boolean');
        expect(info.data.double_data.description).toBe('Multi-line data parameter description. It has two lines for data.');
    });

    it('extracts nested data parameters', () => {
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfo(fixtureSource, classNode as ts.ClassDeclaration);
        expect(info.data.grid.type).toBe('object');
        expect(info.data.grid.description).toBe("Now let's have a grid.");
        expect(info.data.grid.nested).toBeDefined();
    });
});

describe('getExtensionInfoAndExamples', () => {
    const examplesDir = path.resolve(__dirname, '../fixtures/extension/examples');

    it('should extract examples from a provided file', () => {
        const filePath = path.join(examplesDir, 'simple-sentinel-example.html');
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfoAndExamples(fixtureSource, classNode as ts.ClassDeclaration, filePath);
        expect(Object.keys(info.examples)).toHaveLength(1);
        expect(info.examples[filePath]).toBeDefined();
        expect(info.examples[filePath].title).toBe('simple sentinel example');
        expect(info.examples[filePath].path).toBe(filePath);
        expect(info.examples[filePath].code).toBe(
            'var trial = {\n  type: jsPsychTestPlugin,\n  stimulus: "hello",\n  extensions: [\n    {type: jsPsychTestExtension, params: {test: "hi"}}\n  ]\n};'
        );
    });

    it('produces unique titles when two files share the same jspsych-autodoc:title sentinel', () => {
        const collisionDir = path.resolve(__dirname, '../fixtures/extension/title-sentinel-collision-tests');
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const info = getExtensionInfoAndExamples(fixtureSource, classNode as ts.ClassDeclaration, collisionDir);
        const titles = Object.values(info.examples).map((e) => e.title);
        expect(titles).toHaveLength(2);
        expect(new Set(titles).size).toBe(2);
        expect(titles[0]).toBe("my example");
        expect(titles[1]).toBe("my example (2)");
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('my example'));
        warnSpy.mockRestore();
    });

    it('should extract examples from a provided directory', () => {
        const { mainNode: classNode } = identifyPackageType(fixtureSource);
        const info = getExtensionInfoAndExamples(fixtureSource, classNode as ts.ClassDeclaration, examplesDir);
        expect(Object.keys(info.examples)).toHaveLength(4);
        expect(info.examples[path.join(examplesDir, 'ignored-example.html')]).toBeUndefined();

        const simpleSentinelExample = info.examples[path.join(examplesDir, 'simple-sentinel-example.html')];
        expect(simpleSentinelExample.title).toBe('simple sentinel example');
        expect(simpleSentinelExample.path).toBe(path.join(examplesDir, 'simple-sentinel-example.html'));
        expect(simpleSentinelExample.code).toBe(
            'var trial = {\n  type: jsPsychTestPlugin,\n  stimulus: "hello",\n  extensions: [\n    {type: jsPsychTestExtension, params: {test: "hi"}}\n  ]\n};'
        );

        const complexSentinelExample = info.examples[path.join(examplesDir, 'complex-sentinel-example.html')];
        expect(complexSentinelExample.title).toBe('complex sentinel example');
        expect(complexSentinelExample.path).toBe(path.join(examplesDir, 'complex-sentinel-example.html'));
        expect(complexSentinelExample.code).toBe(
            'var jsPsych = initJsPsych({\n    extensions: [\n        {type: jsPsychTestExtension}\n    ]\n});\n\nvar helloTrial = {\n  type: jsPsychTestPlugin,\n  stimulus: "Hello",\n  extensions: [\n    {type: jsPsychTestExtension, params: {test: "hi"}}\n  ]\n};\n\nvar goodbyeTrial = {\n  type: jsPsychTestPlugin,\n  stimulus: "Goodbye",\n  extensions: [\n    {type: jsPsychTestExtension, params: {test: "bye"}}\n  ]\n};'
        );

        const simpleInferredExample = info.examples[path.join(examplesDir, 'simple-inferred-example.html')];
        expect(simpleInferredExample.title).toBe('simple inferred example');
        expect(simpleInferredExample.path).toBe(path.join(examplesDir, 'simple-inferred-example.html'));
        expect(simpleInferredExample.code).toBe(
            'var jsPsych = initJsPsych({\n  extensions: [\n    {type: jsPsychTestExtension, params: {test: "inferred"}}\n  ]\n});\n\nvar trial = {\n  type: jsPsychTestPlugin,\n  stimulus: "World",\n  extensions: [\n    {type: jsPsychTestExtension, params: {test: "trial-level inferred"}}\n  ]\n};'
        );

        const complexInferredExample = info.examples[path.join(examplesDir, 'complex-inferred-example.html')];
        expect(complexInferredExample.title).toBe('complex inferred example');
        expect(complexInferredExample.path).toBe(path.join(examplesDir, 'complex-inferred-example.html'));
        expect(complexInferredExample.code).toBe(
            'var jsPsych = initJsPsych();\n\nvar stimulus = "Hello, world!";\n\nvar duration = 1000;\n\nvar choices = ["f", "j"];\n\nvar trial = {\n  type: jsPsychTestPlugin,\n  stimulus: stimulus,\n  trial_duration: duration,\n  choices: choices,\n  extensions: [\n    {type: jsPsychTestExtension, params: {test: "inferred complex"}}\n  ]\n};'
        );
    });
});
