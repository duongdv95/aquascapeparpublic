import React from "react";

function LoadingIcon(props) {
    const displayLoading = (!props.success) ?
    (
        <div style={{display: "flex"}}>
            <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
            <div 
            style={{
                display: "flex", 
                alignItems: "center", 
                paddingLeft: "0.5em"}}>
                Loading...
            </div>
        </div>
    )
    :
    null
    return (
        displayLoading
    )
}

export default LoadingIcon