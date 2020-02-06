function addErrorMessage(errorMessage, newText) {
    if(errorMessage.length === 0) {
        return errorMessage += newText
    } else {
        return errorMessage + " " + newText
    }
}



module.exports = {
    addErrorMessage
}