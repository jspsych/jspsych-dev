import { getPluginInfo, getPluginInfoAndExamples } from '../../src/parsers/plugin.js';
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { identifyPackageType } from '../../src/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(__dirname, '../fixtures/plugin/basic.ts');
const fixtureSource = ts.createSourceFile(
    fixturePath,
    fs.readFileSync(fixturePath, 'utf-8'),
    ts.ScriptTarget.Latest,
    true
);

describe('getPluginInfo', () => {
    it('extracts name', async () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = await getPluginInfo(fixtureSource, classNode);
        expect(info.name).toBe('test-plugin');
    });

    it('extracts class JSDoc as description', async () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = await getPluginInfo(fixtureSource, classNode);
        expect(info.description).toBe('A test jsPsych plugin.');
    });

    it('extracts parameters with types and descriptions', async () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = await getPluginInfo(fixtureSource, classNode);
        expect(info.parameters.single.type).toBe('ParameterType.STRING');
        expect(info.parameters.single.description).toBe('Single-line description.');
        expect(info.parameters.double_double.type).toBe('ParameterType.INT');
        expect(info.parameters.double_double.description).toBe('Multi-line description. It has two lines for a parameter.');
    });

    it('extracts array flag on parameters', async () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = await getPluginInfo(fixtureSource, classNode);
        expect(info.parameters.list_of_stimuli.array).toBe(true);
    });

    it('extracts data parameters', async () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = await getPluginInfo(fixtureSource, classNode);
        expect(info.data.data_param.type).toBe('ParameterType.FLOAT');
        expect(info.data.data_param.description).toBe('Data parameter description.');
        expect(info.data.double_data.type).toBe('ParameterType.BOOL');
        expect(info.data.double_data.description).toBe('Multi-line data parameter description. It has two lines for data.');
    });
});

describe('getPluginInfoAndExamples', () => {
    const examplesDir = path.resolve(__dirname, '../fixtures/plugin/examples');

    it('should extract examples from provided file', async () => {
        const filePath = path.join(examplesDir, 'simple-sentinel-example.html');
        const { classNode } = identifyPackageType(fixtureSource);
        const info = await getPluginInfoAndExamples(fixtureSource, classNode, filePath);
        expect(Object.keys(info.examples)).toHaveLength(1);
        expect(info.examples['simple sentinel example']).toBeDefined();
        expect(info.examples['simple sentinel example'].path).toBe(filePath);
        expect(info.examples['simple sentinel example'].code).toBe(
            'var trial = {\n  type: jsPsychTestPlugin,\n  stimulus: "hello"\n};'
        );
    });

    it('should extract examples from provided directory', async () => {
        const { classNode } = identifyPackageType(fixtureSource);
        const info = await getPluginInfoAndExamples(fixtureSource, classNode, examplesDir);
        expect(Object.keys(info.examples)).toHaveLength(4);
        expect(info.examples['ignored example']).toBeUndefined();

        const simpleSentinelExample = info.examples['simple sentinel example'];
        expect(simpleSentinelExample.path).toBe(path.join(examplesDir, 'simple-sentinel-example.html'));
        expect(simpleSentinelExample.code).toBe(
            'var trial = {\n  type: jsPsychTestPlugin,\n  stimulus: "hello"\n};'
        );

        const complexSentinelExample = info.examples['complex sentinel example'];
        expect(complexSentinelExample.path).toBe(path.join(examplesDir, 'complex-sentinel-example.html'));
        expect(complexSentinelExample.code).toBe(
            'var fixationTrial = {\n  type: jsPsychTestPlugin,\n  stimulus: "+"\n};\n\nvar stimulusTrial = {\n  type: jsPsychTestPlugin,\n  stimulus: "Hello"\n};\n\nvar feedbackTrial = {\n  type: jsPsychTestPlugin,\n  stimulus: "Correct!"\n};'
        );

        const inferredExample = info.examples['simple inferred example'];
        expect(inferredExample.path).toBe(path.join(examplesDir, 'simple-inferred-example.html'));
        expect(inferredExample.code).toBe(
            'var trial = {\n  type: jsPsychTestPlugin,\n  stimulus: "World"\n};'
        );

        const complexInferredExample = info.examples['complex inferred example'];
        expect(complexInferredExample.path).toBe(path.join(examplesDir, 'complex-inferred-example.html'));
        expect(complexInferredExample.code).toBe(
            'var stimulus = "Hello, world!";\n\nvar duration = 1000;\n\nvar choices = ["f", "j"];\n\nvar trial = {\n  type: jsPsychTestPlugin,\n  stimulus: stimulus,\n  trial_duration: duration,\n  choices: choices\n};'
        );
    });
})