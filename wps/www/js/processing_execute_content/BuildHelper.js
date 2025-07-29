export class BuildHelper {

    // *---------------------------------*
    // | Common first part input builder |
    // *---------------------------------*

    static firstPartBuilder(id, title) {
        // Build the control group
        const control = document.createElement("div");
        control.setAttribute('class', 'control-group');
        control.id = 'processing-input-' + id + '-group';

        // Defined the label
        const label = document.createElement("label");
        label.setAttribute('class', 'jforms-label control-label');
        label.setAttribute('for', 'processing-input-' + id);
        label.innerHTML = title;
        label.id = 'processing-input-' + id + '-label';
        control.appendChild(label);

        // Defined the field group
        const fieldDiv = document.createElement("div");
        fieldDiv.setAttribute('class', 'controls');
        control.appendChild(fieldDiv);

        return [control, fieldDiv];
    }


    // *----------------------------------------*
    // | Complex & Extent partial input builder |
    // *----------------------------------------*

    static partialPartBuilder(id, input) {
        const values = BuildHelper.firstPartBuilder(id, input.title);

        const control = values[0];
        const fieldDiv = values[1];

        // Defined the field
        const field = document.createElement("input");
        field.title = input.title;
        field.id = 'processing-input-' + id;
        field.name = id;
        field.title = input.title;
        fieldDiv.appendChild(field);

        const qgisType = input.metadata.find(item => item.title === "processing:type")?.href;

        // Add a simple class
        field.setAttribute('class', 'qgisType-' + qgisType);

        // Add select for CRS project and map
        const selectorCRS = document.createElement("select");
        selectorCRS.id = 'processing-input-' + id + '-select';
        selectorCRS.setAttribute('class', 'span1 wps-digitizing extent');

        const optionProject = document.createElement("option");
        optionProject.value = lizMap.config.options.qgisProjectProjection.ref;
        optionProject.label = lizMap.config.options.qgisProjectProjection.ref.split(':')[1];
        selectorCRS.appendChild(optionProject);

        const optionMap = document.createElement("option");
        optionMap.value = lizMap.config.options.projection.ref;
        optionMap.label = lizMap.config.options.projection.ref.split(':')[1];
        selectorCRS.appendChild(optionMap);

        // Add a button to draw the extent
        const btn = document.createElement("button");
        btn.id = 'processing-input-' + id + '-btn';
        btn.setAttribute('class', 'btn btn-mini wps-digitizing wkt ' + qgisType);
        btn.innerHTML = 'Drawing ' + qgisType;

        btn.addEventListener("click", (e) => {
            BuildHelper.addEventOnButton(btn);
        });

        lizMap.mainEventDispatcher.addListener(
            BuildHelper.updateDigitizing,
            ['digitizing.featureDrawn']
        );

        return [control, field, selectorCRS, btn];
    }


    // *----------------------------------*
    // | Utils functions to help builders |
    // *----------------------------------*

    /**
     *
     * @param {HTMLButtonElement} btn
     */
    static addEventOnButton(btn) {
        if (btn.className.includes('extent')) {
            BuildHelper.addDigitizingExtentHandler(btn);
        } else if (btn.className.includes('point')) {
            BuildHelper.addDigitizingPointHandler(btn);
        }
    }

    /**
     *
     * @param {HTMLButtonElement} btn
     */
    static addDigitizingExtentHandler(btn) {
        if (btn.className.includes('active')) {
            lizMap.mainLizmap.digitizing.toolSelected = 'deactivate';
            btn.classList.remove('active');
        } else {
            btn.classList.remove('active');
            lizMap.mainLizmap.digitizing.toolSelected = 'box';
            btn.classList.add('active');
        }
    }

    /**
     *
     * @param {HTMLButtonElement} btn
     */
    static addDigitizingPointHandler(btn) {
        if (btn.className.includes('active')) {
            lizMap.mainLizmap.digitizing.toolSelected = 'deactivate';
            btn.classList.remove('active');
        } else {
            btn.classList.remove('active');
            lizMap.mainLizmap.digitizing.toolSelected = 'point';
            btn.classList.add('active');
        }
    }

    static updateDigitizing() {
        const btn = document.querySelector('#processing-input button.wps-digitizing.active');
        if (btn.className.includes('extent')) {
            BuildHelper.updateDigitizingExtent(btn);
        } else if (btn.className.includes('point')) {
            BuildHelper.updateDigitizingPoint(btn);
        }
    }

    static updateDigitizingExtent(activeBtn) {
        const select = activeBtn.previousSibling;
        const feat = lizMap.mainLizmap.digitizing.featureDrawn.at(-1);
        feat.set('text', select.title);
        const bounds = lizMap.ol.extent.applyTransform(
            feat.getGeometry().getExtent(),
            lizMap.ol.proj.getTransform(
                lizMap.ol.proj.get(lizMap.mainLizmap.projection),
                lizMap.ol.proj.get(select.value)
            )
        );
        activeBtn.parentElement.firstChild.value = bounds.join(',') + ' (' + select.value + ')';
        activeBtn.parentElement.firstChild.dispatchEvent(new Event('blur'));
        if (lizMap.mainLizmap.digitizing.featureDrawn.length > 1) {
            lizMap.mainLizmap.digitizing._eraseFeature(lizMap.mainLizmap.digitizing.featureDrawn.at(0));
        }
    }

    static updateDigitizingPoint(activeBtn) {
        const select = activeBtn.previousSibling;
        const feat = lizMap.mainLizmap.digitizing.featureDrawn.at(-1);
        feat.set('text', select.title);
        activeBtn.parentElement.firstChild.value = '{ "geometry": ' +
            (new lizMap.ol.format.GeoJSON()).writeGeometry(
                feat.getGeometry(),
                {featureProjection: lizMap.mainLizmap.projection, dataProjection: select.value}
            ) + ',  "crs": { "type": "name", "properties": { "name": "' + select.value + '" } } }';
        activeBtn.parentElement.firstChild.dispatchEvent(new Event('blur'));
        if (lizMap.mainLizmap.digitizing.featureDrawn.length > 1) {
            lizMap.mainLizmap.digitizing._eraseFeature(lizMap.mainLizmap.digitizing.featureDrawn.at(0));
        }
    }

    static dispatchInputValueUpdate(processId, inputId, inputValue) {
        document.dispatchEvent(new CustomEvent('WPSInputValueChanged', {
            detail: {
                processId: processId.replaceAll(':','-'),
                inputId: inputId,
                newInputValue: inputValue
            }
        }));
    }

    static addError(id, input, text) {
        document.dispatchEvent(new CustomEvent('WPSAddError', {
            detail: {
                id: id,
                input: input,
                text: text
            }
        }));
    }

    static removeError(id) {
        document.dispatchEvent(new CustomEvent('WPSRemoveError', {
            detail: {
                id: id
            }
        }));
    }
}
