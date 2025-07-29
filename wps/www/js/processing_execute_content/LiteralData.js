import {BuildHelper} from "./BuildHelper";

export class LiteralData {

    /**
     *
     * @param {string} id
     * @param {object} input
     * @returns {HTMLElement}
     */
    static getInput(id, input) {
        const cleanId = id.replaceAll(':', '-');

        const values = BuildHelper.firstPartBuilder(
            cleanId,
            input.title
        );

        const control = values[0];
        const fieldDiv = values[1];

        const selectType = [
            "vector",
            "source",
            "raster",
            "boolean",
            "enum"
        ];

        const type = input.metadata.find(item => item.title === "processing:type")?.href;

        if (type === 'boolean')
            input.schema.enum = ['False', 'True'];

        const enumVal = input.schema.enum;

        const field = document.createElement(selectType.includes(type) || enumVal ? "select" : "input");
        field.id = 'processing-input-' + cleanId;
        field.name = cleanId;
        field.title = input.title;
        fieldDiv.appendChild(field);

        field.setAttribute('class', 'qgisType-' + type);

        if (selectType.includes(type) || enumVal) {
            field.addEventListener("change", (e) => {
                BuildHelper.dispatchInputValueUpdate(input.processId, id, field.value);
            });

            const restrictedLayers = this.getRestrictedLayers(cleanId, input);

            const vecAndRast = this.getLayersList(type, restrictedLayers);
            let vectors = vecAndRast[0];
            let rasters = vecAndRast[1];

            if (["vector", "source"].includes(type)) {
                this.fillSelectField(field, vectors);

                if (type === "source") {
                    this.handleSourceType(field, cleanId, input);
                }

            } else if (type === "raster") {
                this.fillSelectField(field, rasters);

            } else { //type === "boolean" || enumVal
                let option = document.createElement("option");
                option.innerHTML = '';
                field.appendChild(option);

                for (let v in input.schema.enum) {
                    option = document.createElement("option");
                    option.value = enumVal[v];
                    option.innerHTML = enumVal[v];
                    field.appendChild(option);
                }
            }
        } else {
            if (type === "number") {
                field.placeholder = input.schema.default;
                field.value = input.schema.default ? input.schema.default : '';
            } else {
                field.placeholder = cleanId;
            }
            field.addEventListener("blur", (e) => {
                this.checkValues(field, id, input, type);
            });
        }

        BuildHelper.dispatchInputValueUpdate(input.processId, id, field.value);

        return control;
    }

    static checkValues(field, inputId,  input, type) {
        if (field.value === '') {
            BuildHelper.addError(field.id, input, "value is empty.");
            BuildHelper.dispatchInputValueUpdate(input.processId, inputId, '');
            return;
        } else {
            BuildHelper.removeError(field.id);
        }

        if (type === "number") {
            const preciseType = input.schema.type === "integer" ? "integer" : "float";

            let reg;
            if (preciseType === "integer") {
                reg = /^-?[0-9]*$/gm;
            } else {
                reg = /^-?[0-9]+(.[0-9]+)?$/gm;
            }

            if (!reg.exec(field.value)) {
                BuildHelper.addError(field.id, input, "value should be " + preciseType + ".");
            } else {
                BuildHelper.removeError(field.id);

                const min = input.schema.minimum;
                const max = input.schema.maximum;

                if (parseFloat(field.value) >= min && parseFloat(field.value) <= max) {
                    BuildHelper.removeError(field.id);
                } else {
                    BuildHelper.addError(
                        field.id,
                        input,
                        "value should be between " + min + " and " + max + "."
                    );
                }
            }
        }

        BuildHelper.dispatchInputValueUpdate(input.processId, inputId, field.value);
    }

    static handleSourceType(field, id, input) {
        const br = document.createElement('br');

        const label = document.createElement("label");
        label.setAttribute("class", "checkbox inline disabled");

        const checkBox = document.createElement("input");
        checkBox.setAttribute("id", 'processing-input-' + id + '-selection');
        checkBox.setAttribute("type", "checkbox");
        checkBox.setAttribute("class", 'selection');
        checkBox.disabled = true;

        field.addEventListener("change", (e) => {
            const docCheckBox = document.getElementById('processing-input-' + id + '-selection');
            if (field.value === "") {
                docCheckBox.disabled = true
                label.classList.add("disabled");
            } else {
                docCheckBox.disabled = false
                label.classList.remove("disabled");
                this.selectionCheckBoxEvent(id, input, field);
            }
        });

        label.addEventListener("click", (e) => {
            this.selectionCheckBoxEvent(id, input, field);
        });

        label.appendChild(checkBox);
        label.innerHTML += "Selection"

        field.parentNode.insertBefore(label, field.nextSibling);
        field.parentNode.insertBefore(br, field.nextSibling);
    }

    static selectionCheckBoxEvent(id, input, field) {
        const docCheckBox = document.getElementById('processing-input-' + id + '-selection');
        if (docCheckBox.checked && !docCheckBox.disabled) {
            let theValue = input.data;
            let layerName = theValue;
            if (layerName?.startsWith('layer:')) {
                layerName = layerName.split('?')[0].slice(6);
            }

            let layerConfig = lizMap.config.layers[layerName];
            if (('selectedFeatures' in layerConfig) && layerConfig.selectedFeatures.length > 0) {
                theValue = 'layer:' + layerName + '?select=' + encodeURIComponent('$id IN ( ' + layerConfig.selectedFeatures.join() + ' )')
            } else if (('filteredFeatures' in layerConfig) && layerConfig.filteredFeatures.length > 0) {
                theValue = 'layer:' + layerName + '?select=' + encodeURIComponent('$id IN ( ' + layerConfig.filteredFeatures.join() + ' )')
            } else if (('request_params' in layerConfig) &&
                ('exp_filter' in layerConfig['request_params']) &&
                layerConfig['request_params']['exp_filter']) {
                theValue = 'layer:' + layerName + '?select=' + encodeURIComponent(layerConfig['request_params']['exp_filter'])
            }
            input.data = theValue;
        } else {
            input.data = field.value;
        }
    }

    static fillSelectField(field, layersList) {
        const baseOption = document.createElement("option");
        baseOption.innerHTML = '';
        field.appendChild(baseOption);

        for (var i = 0, len = layersList.length; i < len; i++) {
            const layer = layersList[i];
            var lConfig = lizMap.config.layers[layer];
            const option = document.createElement("option");
            option.value = layer;
            option.innerHTML = lConfig.title;
            field.appendChild(option);
        }

        if (field.children.length === 2) {
            field.removeChild(baseOption);
        }
    }

    static getLayersList(type, restrictedLayers) {
        let vectorsAndRasters = [[], []];
        if (["vector", "source", "raster"].includes(type)) {
            for (let layer in lizMap.config.layers) {
                var lConfig = lizMap.config.layers[layer];
                if (lConfig.type !== 'layer')
                    continue;
                if (restrictedLayers.length !== 0 && restrictedLayers.indexOf(layer) === -1)
                    continue;
                if ('geometryType' in lConfig) {
                    vectorsAndRasters[0].push(layer);
                } else {
                    vectorsAndRasters[1].push(layer);
                }
            }
        }
        return vectorsAndRasters;
    }

    static getRestrictedLayers(inputId, input) {
        let restrictedLayers = [];
        if (
            typeof wps_wps_project_config !== 'undefined'
            && (input.processId in wps_wps_project_config)
            && (inputId in wps_wps_project_config[input.processId])
        ) {
            restrictedLayers = wps_wps_project_config[input.processId][inputId];
            if (!Array.isArray(restrictedLayers))
                restrictedLayers = [];
        }
        return restrictedLayers;
    }
}
