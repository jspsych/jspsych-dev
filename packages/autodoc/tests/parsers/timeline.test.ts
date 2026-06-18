import { getTimelineInfo, getTimelineInfoAndExamples } from '../../src/parsers/timeline.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(__dirname, '../fixtures/timeline/basic.ts');

describe('getTimelineInfo', () => {
    it('extracts createTimeline helperParameters with types and defaults', () => {
        const info = getTimelineInfo(fixturePath);
        expect(info.createTimeline.description).toBe('Generates a really cool and awesome thing');
        expect(info.createTimeline.helperParameters.jsPsych.type).toBe('JsPsych');
        expect(info.createTimeline.helperParameters.config.type).toBe('BigConfig');
        expect(info.createTimeline.helperParameters.config.default).toBe(
            '{\n    big: "hello",\n    little: -99,\n    extra: { stuff: 3, things: true }\n}'
        );
    });

    it('extracts timelineUnits functions with JSDoc descriptions and param descriptions', () => {
        const info = getTimelineInfo(fixturePath);
        expect(info.timelineUnits.createFixation.description).toBe('creates a fixation. Gasp.');
        expect(info.timelineUnits.createFixation.helperParameters.fixation.type).toBe('string');
        expect(info.timelineUnits.createFixation.helperParameters.fixation.description).toBe('text to be shown');
        expect(info.timelineUnits.createFixation.helperParameters.duration.type).toBe('number');
        expect(info.timelineUnits.createFixation.helperParameters.duration.description).toBe('time to show fixation');

        expect(info.timelineUnits.createFeedbackTrial.description).toBe('AAAA');
        expect(info.timelineUnits.createFeedbackTrial.helperParameters.feedbackMessage.type).toBe('string');
        expect(info.timelineUnits.createFeedbackTrial.helperParameters.canShow.type).toBe('boolean');
    });

    it('excludes functions not present in the exported timelineUnits/utils objects', () => {
        const info = getTimelineInfo(fixturePath);
        expect(info.timelineUnits.notShown).toBeUndefined();
        expect(info.utils.notShown).toBeUndefined();
    });

    it('extracts utils functions', () => {
        const info = getTimelineInfo(fixturePath);
        expect(info.utils.canShowCreature.description).toBe('can you show the creature or not');
        expect(info.utils.canShowCreature.helperParameters.sentiment.type).toBe('string');
    });

    it('hoists an interface used by 2 or more functions, replacing nested with interfaceRef', () => {
        const info = getTimelineInfo(fixturePath);
        expect(info.interfaces.BigConfig).toBeDefined();
        expect(info.interfaces.BigConfig.description).toBe('bigggg configggg');
        expect(info.interfaces.BigConfig.interfaceParameters.big.type).toBe('string');
        expect(info.interfaces.BigConfig.interfaceParameters.little.type).toBe('number');
        expect(info.interfaces.BigConfig.interfaceParameters.extra.type).toBe('StimulusConfig');

        expect(info.createTimeline.helperParameters.config.interfaceRef).toBe('BigConfig');
        expect(info.createTimeline.helperParameters.config.nested).toBeUndefined();
        expect(info.utils.canShowCreature.helperParameters.config.interfaceRef).toBe('BigConfig');
        expect(info.utils.canShowCreature.helperParameters.config.nested).toBeUndefined();
    });

    it('does not hoist an interface that is only referenced as a nested field of an already-hoisted interface', () => {
        const info = getTimelineInfo(fixturePath);
        expect(info.interfaces.StimulusConfig).toBeUndefined();
        expect(Object.keys(info.interfaces)).toEqual(['BigConfig']);
        expect(info.interfaces.BigConfig.interfaceParameters.extra.interfaceRef).toBeUndefined();
        expect(info.interfaces.BigConfig.interfaceParameters.extra.nested).toEqual({
            stuff: { type: 'number', description: 'some stuff' },
            things: { type: 'boolean', description: 'some things' },
        });
    });
});

describe('getTimelineInfoAndExamples', () => {
    const examplesDir = path.resolve(__dirname, '../fixtures/timeline/examples');

    it('should extract examples from a provided file', () => {
        const filePath = path.join(examplesDir, 'simple-sentinel-example.html');
        const info = getTimelineInfoAndExamples(fixturePath, filePath);
        expect(Object.keys(info.examples)).toHaveLength(1);
        expect(info.examples['simple sentinel example']).toBeDefined();
        expect(info.examples['simple sentinel example'].path).toBe(filePath);
        expect(info.examples['simple sentinel example'].code).toBe(
            'const config = {\n    testParam: 1,\n    testParam2: "hello hello"\n}\n\nconst timeline = jsPsychTestTimeline.createTimeline(jsPsych, config);'
        );
    });

    it('should extract examples from a provided directory', () => {
        const info = getTimelineInfoAndExamples(fixturePath, examplesDir);
        expect(Object.keys(info.examples)).toHaveLength(4);
        expect(info.examples['ignored example']).toBeUndefined();

        const simpleSentinelExample = info.examples['simple sentinel example'];
        expect(simpleSentinelExample.path).toBe(path.join(examplesDir, 'simple-sentinel-example.html'));
        expect(simpleSentinelExample.code).toBe(
            'const config = {\n    testParam: 1,\n    testParam2: "hello hello"\n}\n\nconst timeline = jsPsychTestTimeline.createTimeline(jsPsych, config);'
        );

        const complexSentinelExample = info.examples['complex sentinel example'];
        expect(complexSentinelExample.path).toBe(path.join(examplesDir, 'complex-sentinel-example.html'));
        expect(complexSentinelExample.code).toBe(
            'var fixationTrial = jsPsychTestTimeline.createFixationTrial("+");\n\nvar stimulusTrial = jsPsychTestTimeline.createStimulusTrial(\n    "hello",\n    12,\n    true\n)\n\nvar feedbackTrial = jsPsychTestTimeline.createFeedbackTrial(false);'
        );

        const simpleInferredExample = info.examples['simple inferred example'];
        expect(simpleInferredExample.path).toBe(path.join(examplesDir, 'simple-inferred-example.html'));
        expect(simpleInferredExample.code).toBe(
            'const config = {\n    testParam: 1,\n    testParam2: "hello hello"\n}\n\nconst timeline = jsPsychTestTimeline.createTimeline(jsPsych, config);'
        );

        const complexInferredExample = info.examples['complex inferred example'];
        expect(complexInferredExample.path).toBe(path.join(examplesDir, 'complex-inferred-example.html'));
        expect(complexInferredExample.code).toBe(
            'const fixationConfig = {\n    fixation: "+",\n    duration: 1000,\n}\n\nconst fixationTrial = jsPsychTestTimeline.timelineUnits.createFixation(fixationConfig);\n\nconst stimulusConfig = {\n    stimuli: ["hello", "cheese wheel"],\n    duration: [250, 1000],\n}\n\nconst stimulusTrial = jsPsychTestTimeline.timelineUnits.createStimulus({\n    ...stimulusConfig, \n    reverse: true\n})\n\nlet feedbackMessage = "dog";\n\nconst feedbackTrial = jsPsychTestTimeline.timelineUnits.createFeedbackTrial({\n    feedback: feedbackMessage,\n    showCreature: jsPsychTestTimeline.utils.canShowCreature("maybe")\n})'
        );
    });
});
