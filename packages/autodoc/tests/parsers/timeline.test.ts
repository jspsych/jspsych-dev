import { getTimelineInfo, getTimelineInfoAndExamples } from '../../src/parsers/timeline.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(__dirname, '../fixtures/timeline/basic.ts');
const destructuredFixturePath = path.resolve(__dirname, '../fixtures/timeline/destructured.ts');
const typeofHoistFixturePath = path.resolve(__dirname, '../fixtures/timeline/typeof-hoist.ts');

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

describe('getTimelineInfo with destructured parameters', () => {
    it('parses a destructured object parameter instead of dropping it', () => {
        const info = getTimelineInfo(destructuredFixturePath);
        const config = info.createTimeline.helperParameters.config;
        expect(config).toBeDefined();
        expect(config.type).toBe('SharedConfig');
        expect(config.default).toBe('{}');
    });

    it('names a destructured parameter from its leftover JSDoc @param tag', () => {
        const info = getTimelineInfo(destructuredFixturePath);
        expect(info.createTimeline.helperParameters.config.description).toBe('tuning knobs');
    });

    it('falls back to "config" when a destructured parameter has no JSDoc tag', () => {
        const info = getTimelineInfo(destructuredFixturePath);
        expect(info.timelineUnits.createWidget.helperParameters.config).toBeDefined();
    });

    it('hoists a config interface shared by destructured parameters across functions', () => {
        const info = getTimelineInfo(destructuredFixturePath);
        // SharedConfig is the type of the destructured param in both createTimeline and createPractice
        expect(info.interfaces.SharedConfig).toBeDefined();
        expect(info.interfaces.SharedConfig.description).toBe('shared config nation');
        expect(info.interfaces.SharedConfig.interfaceParameters.show.type).toBe('boolean');

        expect(info.createTimeline.helperParameters.config.interfaceRef).toBe('SharedConfig');
        expect(info.createTimeline.helperParameters.config.nested).toBeUndefined();
        expect(info.timelineUnits.createPractice.helperParameters.config.interfaceRef).toBe('SharedConfig');
        expect(info.timelineUnits.createPractice.helperParameters.config.nested).toBeUndefined();
    });

    it('overlays per-field defaults from binding elements (non-hoisted inline literal)', () => {
        const info = getTimelineInfo(destructuredFixturePath);
        // createWidget uses an inline type literal, so it is not hoisted and keeps nested members
        const widgetConfig = info.timelineUnits.createWidget.helperParameters.config;
        expect(widgetConfig.interfaceRef).toBeUndefined();
        expect(widgetConfig.nested).toBeDefined();
        expect(widgetConfig.nested!.label.type).toBe('string');
        expect(widgetConfig.nested!.label.default).toBe('"ok"');
        expect(widgetConfig.nested!.repeat.default).toBe('2');
        // an inline object literal type is never hoisted into the shared interfaces section
        expect(Object.keys(info.interfaces)).toEqual(['SharedConfig']);
    });

    it('keeps the `typeof X` label and expands the value shape inline when not hoisted', () => {
        const info = getTimelineInfo(destructuredFixturePath);
        // typeof trial_text is only referenced once (as a nested field), so it is not
        // hoisted; its underlying object shape is expanded inline instead.
        const textObject = info.interfaces.SharedConfig.interfaceParameters.text_object;
        expect(textObject.type).toBe('typeof trial_text');
        expect(textObject.nested).toEqual({
            next: { type: 'string', default: '"Next"' },
            count: { type: 'number', default: '3' },
        });
    });
});

describe('getTimelineInfo with `typeof` value-shape parameters', () => {
    it('hoists a `typeof x` object shape used as a parameter type in 2+ functions', () => {
        const info = getTimelineInfo(typeofHoistFixturePath);
        expect(Object.keys(info.interfaces)).toEqual(['trial_text']);
        expect(info.interfaces.trial_text.description).toBe('the text bag shared across the task');
    });

    it('infers field types from the object values and keeps each value as the default', () => {
        const info = getTimelineInfo(typeofHoistFixturePath);
        const fields = info.interfaces.trial_text.interfaceParameters;
        expect(fields.next_button.type).toBe('string');
        expect(fields.next_button.default).toBe('"Next"');
        expect(fields.next_button.description).toBe('the go-ahead label');
        expect(fields.pages.type).toBe('string');
        expect(fields.pages.array).toBe(true);
        expect(fields.format.type).toBe('function');
    });

    it('replaces each hoisted `typeof x` site with an interfaceRef while keeping the typeof label', () => {
        const info = getTimelineInfo(typeofHoistFixturePath);
        const instructionsText = info.timelineUnits.createInstructions.helperParameters.text;
        expect(instructionsText.type).toBe('typeof trial_text');
        expect(instructionsText.interfaceRef).toBe('trial_text');
        expect(instructionsText.nested).toBeUndefined();
        expect(info.timelineUnits.createDebrief.helperParameters.text.interfaceRef).toBe('trial_text');
    });

    it('collapses a hoisted type to a ref even where it appears nested inside another type', () => {
        const info = getTimelineInfo(typeofHoistFixturePath);
        // createTimeline's inline config has a `text_object: typeof trial_text` field;
        // since trial_text is hoisted, that nested field should be a ref, not expanded inline.
        const config = info.createTimeline.helperParameters.config;
        expect(config.nested).toBeDefined();
        const textObject = config.nested!.text_object;
        expect(textObject.type).toBe('typeof trial_text');
        expect(textObject.interfaceRef).toBe('trial_text');
        expect(textObject.nested).toBeUndefined();
    });
});

describe('getTimelineInfoAndExamples', () => {
    const examplesDir = path.resolve(__dirname, '../fixtures/timeline/examples');

    it('should extract examples from a provided file', () => {
        const filePath = path.join(examplesDir, 'simple-sentinel-example.html');
        const info = getTimelineInfoAndExamples(fixturePath, filePath);
        expect(Object.keys(info.examples)).toHaveLength(1);
        expect(info.examples[filePath]).toBeDefined();
        expect(info.examples[filePath].title).toBe('simple sentinel example');
        expect(info.examples[filePath].path).toBe(filePath);
        expect(info.examples[filePath].code).toBe(
            'const config = {\n    testParam: 1,\n    testParam2: "hello hello"\n}\n\nconst timeline = jsPsychTestTimeline.createTimeline(jsPsych, config);'
        );
    });

    it('should extract examples from a provided directory', () => {
        const info = getTimelineInfoAndExamples(fixturePath, examplesDir);
        expect(Object.keys(info.examples)).toHaveLength(4);
        expect(info.examples[path.join(examplesDir, 'ignored-example.html')]).toBeUndefined();

        const simpleSentinelExample = info.examples[path.join(examplesDir, 'simple-sentinel-example.html')];
        expect(simpleSentinelExample.title).toBe('simple sentinel example');
        expect(simpleSentinelExample.path).toBe(path.join(examplesDir, 'simple-sentinel-example.html'));
        expect(simpleSentinelExample.code).toBe(
            'const config = {\n    testParam: 1,\n    testParam2: "hello hello"\n}\n\nconst timeline = jsPsychTestTimeline.createTimeline(jsPsych, config);'
        );

        const complexSentinelExample = info.examples[path.join(examplesDir, 'complex-sentinel-example.html')];
        expect(complexSentinelExample.title).toBe('complex sentinel example');
        expect(complexSentinelExample.path).toBe(path.join(examplesDir, 'complex-sentinel-example.html'));
        expect(complexSentinelExample.code).toBe(
            'var fixationTrial = jsPsychTestTimeline.createFixationTrial("+");\n\nvar stimulusTrial = jsPsychTestTimeline.createStimulusTrial(\n    "hello",\n    12,\n    true\n)\n\nvar feedbackTrial = jsPsychTestTimeline.createFeedbackTrial(false);'
        );

        const simpleInferredExample = info.examples[path.join(examplesDir, 'simple-inferred-example.html')];
        expect(simpleInferredExample.title).toBe('simple inferred example');
        expect(simpleInferredExample.path).toBe(path.join(examplesDir, 'simple-inferred-example.html'));
        expect(simpleInferredExample.code).toBe(
            'const config = {\n    testParam: 1,\n    testParam2: "hello hello"\n}\n\nconst timeline = jsPsychTestTimeline.createTimeline(jsPsych, config);'
        );

        const complexInferredExample = info.examples[path.join(examplesDir, 'complex-inferred-example.html')];
        expect(complexInferredExample.title).toBe('complex inferred example');
        expect(complexInferredExample.path).toBe(path.join(examplesDir, 'complex-inferred-example.html'));
        expect(complexInferredExample.code).toBe(
            'const fixationConfig = {\n    fixation: "+",\n    duration: 1000,\n}\n\nconst fixationTrial = jsPsychTestTimeline.timelineUnits.createFixation(fixationConfig);\n\nconst stimulusConfig = {\n    stimuli: ["hello", "cheese wheel"],\n    duration: [250, 1000],\n}\n\nconst stimulusTrial = jsPsychTestTimeline.timelineUnits.createStimulus({\n    ...stimulusConfig, \n    reverse: true\n})\n\nlet feedbackMessage = "dog";\n\nconst feedbackTrial = jsPsychTestTimeline.timelineUnits.createFeedbackTrial({\n    feedback: feedbackMessage,\n    showCreature: jsPsychTestTimeline.utils.canShowCreature("maybe")\n})'
        );
    });
});
