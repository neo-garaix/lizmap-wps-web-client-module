import {Utils} from "./Utils";
import {BuildHelper} from "./BuildHelper";

export class ComplexData {

    /**
     *
     * @param {string} id
     * @param {object} input
     * @returns {HTMLElement}
     */
    static getInput(id, input) {
        const values = BuildHelper.partialPartBuilder(
            id.replaceAll(':', '-'),
            input
        );

        const control = values[0];
        const field = values[1];
        const selectorCRS = values[2];
        const btn = values[3];

        field.addEventListener("blur", (e) => {
            this.checkValues(field, id, input);
        });

        const br = document.createElement('br');

        field.parentNode.insertBefore(br, field.nextSibling);
        field.parentNode.insertBefore(selectorCRS, br.nextSibling);
        field.parentNode.insertBefore(btn, selectorCRS.nextSibling);

        return control;
    }

    static checkValues(field, id, input) {
        if (field.value === '') {
            Utils.addError(field.id, input, "value is empty.")
        } else {
            Utils.removeError(field.id);
        }
        const val = field.value ? {
            complexData: {
                //mimeType: 'application/wkt',
                mimeType: 'application/vnd.geo+json',
                encoding: 'utf8',
                schema: '',
                value: field.value
            }
        } : '';
        Utils.dispatchInputValueUpdate(input.processId, id, val);
    }
}
