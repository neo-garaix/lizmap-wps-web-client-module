import {Errors} from "./Errors";
import {FlashMessage} from "../other_components/FlashMessage";

export class Utils {

    // *---------------*
    // | Error gateway |
    // *---------------*

    static addError(id, input, text) {
        Errors.addError(id, input, text);
    }

    static removeError(id) {
        Errors.removeError(id);
    }

    static hasError() {
        return Errors.hasError();
    }

    static resetErrors() {
        Errors.resetErrors();
    }


    // *----------------*
    // | Flash messages |
    // *----------------*

    static addFlashMessage(message, type, closable, duration) {
        const msg = new FlashMessage(message, type, closable, duration);

        if(duration !== undefined){
            setTimeout(function() {
                msg.removeElement();
            }, duration);
        }
    }


    // *------------------------------------------------*
    // | Utils functions to help retrieving information |
    // *------------------------------------------------*

    static getProcessingTypeFromMetadata(metadata) {
        for (let i = 0; i < metadata.length; i++) {
            if (metadata[i].title === "processing:type") {
                return metadata[i].href;
            }
        }

        return "undefined"
    }

    static getProcessingDataTypeFromMetadata(metadata) {
        for (let i = 0; i < metadata.length; i++) {
            if (metadata[i].title === "processing:dataType") {
                return metadata[i].href;
            }
        }

        return "undefined"
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

}
