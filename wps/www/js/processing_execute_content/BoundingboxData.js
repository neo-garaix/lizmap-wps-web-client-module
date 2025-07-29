import {BuildHelper} from "./BuildHelper";

export class BoundingboxData {

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

        field.placeholder = "left,bottom,right,top (EPSG:4326)";

        const br = document.createElement('br');

        field.parentNode.insertBefore(br, field.nextSibling);
        field.parentNode.insertBefore(selectorCRS, br.nextSibling);
        field.parentNode.insertBefore(btn, selectorCRS.nextSibling);

        return control;
    }

    // Parse field value: number,number,number,number EPSG:integer
    static checkValues(field, id, input) {
        let reg = /(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *\((EPSG:\d+)\)/gi;
        let matches = reg.exec(field.value);

        if (matches === undefined || matches?.length !== 6) {
            BuildHelper.addError(field.id, input, "value isn't correct.")
            BuildHelper.dispatchInputValueUpdate(input.processId, id, '');
            return;
        } else {
            BuildHelper.removeError(field.id);
        }

        // get projection value to upper case
        let proj = matches[5].toUpperCase();
        // Build bounds
        let b = [matches[1], matches[2], matches[3], matches[4]]
        if (proj === 'EPSG:4326') {
            b = [matches[2], matches[1], matches[4], matches[3]]
        }

        b = {
            left: b[0],
            bottom: b[1],
            right: b[2],
            top: b[3]
        }

        BuildHelper.dispatchInputValueUpdate(
            input.processId,
            id,
            {
                boundingBoxData: {
                    projection: proj,
                    bounds: b
                }
            });
    }
}
