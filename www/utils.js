module.exports = {
    /**
     * Compare two face templates and return a similarity score
     * @param {(string|number[])} t1 Face template (array of floating point integer values or base 64 encoded string)
     * @param {(string|number[])} t2 Face template (array of floating point integer values or base 64 encoded string)
     * @param {number} [norm1=1] Template 1 norm (optional)
     * @param {number} [norm2=1] Template 2 norm (optional)
     * @returns {number} Similarity score between 0.0 and 1.0
     */
    "compareFaceTemplates": function(t1, t2, norm1, norm2) {
        if (typeof t1 === "string") {
            t1 = this.base64ToFloat32Array(t1);
        }
        if (typeof t2 === "string") {
            t2 = this.base64ToFloat32Array(t2);
        }
        if (norm1 && norm2) {
            return get_score_between_templates_with_specified_norms(t1, t2, norm1, norm2);
        } else {
            return get_score_between_templates_with_unit_norms(t1, t2);
        }
    },
    "getNorm": function(template) {
        return get_norm(template);
    },
    /**
     * Decode a base 64 encoded string to an array of 32-bit floating point integer values
     * @param {string} base64 Base 64 string
     * @returns Array of floating point integers
     */
    "base64ToFloat32Array": function(base64) {
        var buffer = new Buffer(base64, "base64");
        var bytes = new Uint8Array(buffer.length);
        var dataView = new DataView(bytes.buffer);
        for (var i=0; i<dataView.byteLength; i++) {
            dataView.setUint8(i, buffer[i]);
        }
        var floats = [];
        for (var i=0; i<dataView.byteLength; i+=4) {
            floats.push(dataView.getFloat32(i));
        }
        return floats;
    },
    /**
     * Encode an array of 32-bit floating point integer values to a base 64 string
     * @param {number[]} floatArray Array of floating point integers
     * @returns Array converted to string
     */
    "float32ArrayToBase64": function(floatArray) {
        var bytes = new Uint8Array(floatArray.length*4);
        var dataView = new DataView(bytes.buffer);
        for (var i=0; i<floatArray.length; i++) {
            dataView.setFloat32(i*4, floatArray[i]);
        }
        var outputBytes = new Uint8Array(bytes.length);
        for (var i=0; i<dataView.byteLength; i++) {
            outputBytes[i] = dataView.getUint8(i);
        }
        var buffer = new Buffer(outputBytes);
        return buffer.toString("base64");
    }
};