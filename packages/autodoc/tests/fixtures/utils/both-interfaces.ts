import { JsPsychPlugin, JsPsychExtension } from "../../utils.js";

class InvalidClass implements JsPsychPlugin<any>, JsPsychExtension {
    trial(_display_element: HTMLElement, _trial: any): void {}
}
