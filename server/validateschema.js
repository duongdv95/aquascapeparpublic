const {addErrorMessage} = require("./helper.js")

var fixtureSchema = {
    "make": {
        isLength: {
            errorMessage: "Make is empty",
            options: {min: 1}
        }
    },
    "model": {
        isLength: {
            errorMessage: "Model is empty",
            options: {min: 1}
        }
    },
    "specifications": {
        custom: {
            options: (specifications) => {
                let {dimensions_inch, spectrum, description, power_watts} = specifications
                let errorMessage = ""
                for(var dimension in dimensions_inch) {
                    if(dimensions_inch[dimension].length === 0) {
                        errorMessage = addErrorMessage(errorMessage, `Missing ${dimension}.`)
                    }
                    if(dimensions_inch[dimension] && isNaN(dimensions_inch[dimension])) {
                        errorMessage = addErrorMessage(errorMessage, `Invalid ${dimension}.`)
                    }
                }
                if (spectrum && isNaN(spectrum)) {
                    errorMessage = addErrorMessage(errorMessage, "Invalid spectrum, enter only numbers.")
                }
                if (spectrum.length === 0) {
                    errorMessage = addErrorMessage(errorMessage, "Missing spectrum.")
                }
                if (description.length === 0) {
                    errorMessage = addErrorMessage(errorMessage, "Missing description.")
                }
                if (power_watts.length === 0) {
                    errorMessage = addErrorMessage(errorMessage, "Missing power.")
                }
                if (power_watts && isNaN(power_watts)) {
                    errorMessage = addErrorMessage(errorMessage, "Invalid power, enter only numbers.")
                }
                if (errorMessage) {
                    throw new Error(errorMessage)
                }
                return true
            }
        }
    },
    "PAR": {
        custom: {
            options: (parObject) => {
                let parAtHeightInches = parObject.depth_from_center["0"].height
                let count = 0
                let errorMessage = ""
                for(var height in parAtHeightInches) {
                    count++
                    if(parAtHeightInches[height].length === 0) {
                        errorMessage = addErrorMessage(errorMessage, `Missing PAR at ${height} inches.`)
                    }
                    if(parAtHeightInches[height] && isNaN(parAtHeightInches[height])) {
                        errorMessage = addErrorMessage(errorMessage, `Invalid PAR at ${height}, enter only numbers.`)
                    }
                }
                if(count < 3) {
                    errorMessage = addErrorMessage(errorMessage, "Enter at least three data points.")
                }
                if(errorMessage) {
                    throw new Error(errorMessage)
                }
                return true
            }
        }
    },
    "product_links": {
        custom: {
            options: (productLinks) => {
                let atLeastOneLink = false
                for(var link in productLinks) {
                    if(productLinks[link].length > 0) {
                        atLeastOneLink = true
                    }
                }
                if(atLeastOneLink) {
                    return true
                } else {
                    throw new Error("Missing product link")
                }
            }
        }
    }
    //validate notes necessary?
}

module.exports = {fixtureSchema}