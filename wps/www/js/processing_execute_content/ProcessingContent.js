import { LiteralData } from "./LiteralData";
import { BoundingboxData } from "./BoundingboxData";
import { ComplexData } from "./ComplexData";

export class ProcessingContent {

    /**
     *
     * @param {object} inputJSON
     * @returns {HTMLElement[]}
     * @constructor
     */
    static GetProcessingForm(inputJSON) {
        let listInput = [];

        for (const [key, value] of Object.entries(inputJSON)) {
            let HTMLElement = null;
            switch (value.typeHint) {
                case "literalData":
                    HTMLElement = LiteralData.getInput(key, value);
                    break;
                case "boundingboxData":
                    HTMLElement = BoundingboxData.getInput(key, value);
                    break;
                case "complexData":
                    HTMLElement = ComplexData.getInput(key, value);
                    break;
                default:
                    console.error("TypeHint " + value.typeHint + " not supported.");
            }
            if (HTMLElement && value.minOccurs > 0) {
                const label = HTMLElement.querySelector("label");
                label.classList.add('jforms-required');
                const span = document.createElement('span');
                span.classList.add('jforms-required-star');
                span.appendChild(document.createTextNode("* "));
                label.appendChild(span);
            }
            listInput.push(HTMLElement);
        }

        return listInput;
    }
}
