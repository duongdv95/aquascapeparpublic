import React from "react";
import Nav from "../components/nav";
import Footer from "../components/footer";
import axios from "axios";
import validator from "validator";
import Header from "../components/header";
import Router from 'next/router'

function DataEntryFields(props) {
    let depth_from_center = props.depth_from_center
    let displayDepth = depth_from_center.map((element) => {
        let placeholder = `PAR at height 3", 6", 9", etc`
        return (
            <React.Fragment key={element}>
                <label>Enter PAR at depth from center: {element}"</label>
                <input
                name="par"
                type="text"
                depth={element}
                placeholder={placeholder}
                onChange={props.handleChange}/>
            </React.Fragment>
        )
    })
    return (
        <form name="fixtureForm" id="fixture-form" onSubmit={props.handleSubmit}>
            <div className="input">
                <label>Make</label>
                <input
                    name="make"
                    type="text"
                    placeholder="Enter make"
                    onChange={props.handleChange} 
                />
                <label>Model</label>
                <input
                    name="model"
                    type="text"
                    placeholder="Enter model"
                    onChange={props.handleChange} 
                />
                <label>Dimensions (inches)</label>
                <input
                    name="dimensions"
                    type="text"
                    placeholder="Enter L,W,H"
                    onChange={props.handleChange} 
                />   
                <label>Max Mounting Width</label>
                <input
                    name="max_mounting_width"
                    type="text"
                    placeholder="Enter max mounting width"
                    onChange={props.handleChange} 
                />  
                <label>Spectrum</label>
                <input
                    name="spectrum"
                    type="text"
                    placeholder="Enter spectrum"
                    onChange={props.handleChange} 
                />  
                <label>Description</label>
                <input
                    name="description"
                    type="text"
                    placeholder="Enter description"
                    onChange={props.handleChange} 
                />
                <label>Power (watts)</label>
                <input
                    name="power"
                    type="text"
                    placeholder="Enter power"
                    onChange={props.handleChange} 
                />  
                <label>Amazon Link (optional)</label>
                <input
                    name="amazon"
                    type="text"
                    placeholder="Enter amazon link"
                    onChange={props.handleChange}
                /> 
                <label>Ebay Link (optional)</label>
                <input
                    name="ebay"
                    type="text"
                    placeholder="Enter ebay link"
                    onChange={props.handleChange}
                /> 
                <label>Notes (optional)</label>
                <textarea
                    name="notes"
                    placeholder="Enter notes"
                    onChange={props.handleChange}
                />
                {displayDepth}
                <button
                    name="add-depth"
                    onClick={props.handlePARChange}
                    type="button">
                    + Depth
                </button>
                <button
                    name="remove-depth"
                    onClick={props.handlePARChange}
                    type="button">
                    - Depth
                </button>
                <button>Submit</button> 
            </div>
        </form>
    )
}

class FixtureForm extends React.Component {
    renderDataEntryFields() {
        return (
            <DataEntryFields
            handleChange = {this.props.handleChange}
            handleSubmit = {this.props.handleSubmit}
            handlePARChange = {this.props.handlePARChange}
            depth_from_center = {this.props.depth_from_center} 
            />
        )
    }
    render() {
        return(
            <div>
                {this.renderDataEntryFields()}
            </div>
        )
    }
}

class CreateFixture extends React.Component {
    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handlePARChange = this.handlePARChange.bind(this)
        this._isMounted = false
        this.state = {
            make: "",
            model: "",
            dimensions: "",
            max_mounting_width: "",
            spectrum: "",
            description: "",
            power_watts: "",
            amazon: "",
            ebay: "",
            notes: "",
            PAR: {depth_from_center:{}},
            errorMessage: "",
            fixtureObject: "",
            depth_from_center: [0]
        }
    }

    verifyFixtureData(state) {
        let dimensionsArray = state.dimensions.split(",")
        let fixtureDataBoolean = {}
        if (!validator.isNumeric(state.spectrum) || validator.isEmpty(state.spectrum)) {
            fixtureDataBoolean.spectrum = false
        }
        if (validator.isEmpty(state.make)) {
            fixtureDataBoolean.make = false
        }
        if (validator.isEmpty(state.model)) {
            fixtureDataBoolean.model = false
        }
        if (dimensionsArray.length > 3 || dimensionsArray.length < 3) {
            fixtureDataBoolean.dimensions = false
        }
        if (validator.isEmpty(state.max_mounting_width) || !validator.isNumeric(state.max_mounting_width)) {
            fixtureDataBoolean.max_mounting_width = false
        }
        if (validator.isEmpty(state.description)) {
            fixtureDataBoolean.description = false
        }
        if (validator.isEmpty(state.power_watts) || !validator.isNumeric(state.power_watts)) {
            fixtureDataBoolean.power_watts = false
        }
        if (Object.entries(state.PAR.depth_from_center).length === 0) {
            fixtureDataBoolean.PAR = false
        }
        if (!(validator.isEmpty(state.amazon)) && !(validator.isURL(state.amazon))) {
            fixtureDataBoolean.amazon = false
        }
        if (!(validator.isEmpty(state.ebay)) && !(validator.isURL(state.ebay))) {
            fixtureDataBoolean.ebay = false
        }
        for (let property in fixtureDataBoolean) {
            if(fixtureDataBoolean[property] === false) {
                return {success: false, fixtureDataBoolean}
            }
        }
        return {success: true}
    }
    
    formatFixtureData(state) {
        let dimensionsArray = state.dimensions.split(",")
        let specifications = { dimensions_inch: {}}        
        let fixtureObject = { product_links: {} }
        for (let i = 0; i < dimensionsArray.length; i++) {
            if (!validator.isNumeric(dimensionsArray[i])) {
                return false
            }
            if (i === 0) {
                specifications.dimensions_inch.length = parseInt(dimensionsArray[i])
            }
            if (i === 1) {
                specifications.dimensions_inch.width = parseInt(dimensionsArray[i])
            }
            if (i === 2) {
                specifications.dimensions_inch.height = parseInt(dimensionsArray[i])
            }
        }
        specifications.spectrum = parseInt(state.spectrum)
        specifications.description = state.description
        specifications.power_watts = parseInt(state.power_watts)
        specifications.dimensions_inch.max_mounting_width = parseInt(state.max_mounting_width)
        fixtureObject.PAR = state.PAR
        fixtureObject.specifications = specifications
        fixtureObject.make = state.make.trim()
        fixtureObject.model = state.model.trim()
        if(!validator.isEmpty(state.notes)) {
            fixtureObject.notes = state.notes
        }
        if(state.amazon) {
            fixtureObject.product_links.amazon = state.amazon
        }
        if(state.ebay) {
            fixtureObject.product_links.ebay = state.ebay
        }
        return fixtureObject
    }

    addFixture(fixtureData) {
        try {
            const response = axios.post("/api/addFixture", fixtureData, { headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}})
            return response
        } catch (error) {
            return error.response
        }
    }

    async handleSubmit(event) {
        event.preventDefault()
        const eventType = event.target.name
        const state = this.state
        let fixtureData, response
        switch(eventType) {
            case "fixtureForm":
            let isDataCorrectlyFormatted = this.verifyFixtureData(state)
            if (isDataCorrectlyFormatted.success) {
                fixtureData = this.formatFixtureData(state)
                response = await this.addFixture(fixtureData)
                if(response.data.success) {
                    let href = `/admin/imageupload/${response.data.url_id}`
                    let as = href
                    Router.push(href, as, {shallow: true});
                } 
            } else {
                let dataErrors = isDataCorrectlyFormatted.fixtureDataBoolean
                let errorArray = []
                for(let key in dataErrors) {
                    errorArray.push(key)
                }
                let errorMessage = errorArray.join("/") + " missing or formatted incorrectly."
                this.setState({ errorMessage })
            }
            
            break
            default: console.log("error")
        }
    }

    handlePARChange(event) {
        const eventType = event.target.name
        let depth_from_center = this.state.depth_from_center
        let lastInArray = depth_from_center[depth_from_center.length - 1]
        let PAR = this.state.PAR
        switch (eventType) {
            case "add-depth":
                depth_from_center.push(lastInArray + 3)
                this.setState({ depth_from_center })
                break
            case "remove-depth":
                if(depth_from_center.length > 1) {
                    delete PAR.depth_from_center[lastInArray]
                    depth_from_center.pop(lastInArray)
                    this.setState({ depth_from_center, PAR })
                }
                break
            default:
                console.log("error")
        }
    }

    handleChange(event) {
        const eventType = event.target.name
        switch (eventType) {
            case "make":
                this.setState({ make: event.target.value })
                break

            case "model":
                this.setState({ model: event.target.value })
                break

            case "dimensions":
                this.setState({ dimensions: event.target.value })
                break

            case "max_mounting_width":
                this.setState({ max_mounting_width: event.target.value })
                break

            case "spectrum":
                this.setState({ spectrum: event.target.value })
                break

            case "description":
                this.setState({ description: event.target.value })
                break

            case "power":
                this.setState({ power_watts: event.target.value })
                break

            case "amazon":
                this.setState({ amazon: event.target.value })
                break

            case "ebay":
                this.setState({ ebay: event.target.value })
                break

            case "notes":
                this.setState({ notes: event.target.value })
                break

            case "par":
                let PAR = this.formatPAR({PAR: this.state.PAR, event})
                this.setState({ PAR })
                break

            default:
                console.log("error")
        }
    }

    formatPAR({PAR, event}) {
        let PARInput = event.target.value
        let PARArray = PARInput.split(",")
        let depth = event.target.attributes["depth"].value
        let height = {}
        PARArray.forEach((element, index) => {
            height[(index + 1)*3] = parseInt(element)
        })
        PAR.depth_from_center[depth] = {height}
        return PAR
    }

    async componentDidMount() {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
    }
    render() {
        return (
            <div id="create-fixture" className="container">
                <Header/>
                <Nav
                isDisabled={true}
                />
                <div className="main">
                    <h1>Step 1: Enter Fixture Data </h1>
                    <FixtureForm
                    handleChange = {this.handleChange}
                    handleSubmit = {this.handleSubmit}
                    depth_from_center = {this.state.depth_from_center}
                    handlePARChange = {this.handlePARChange}
                    />
                </div>
                <Footer/>
            </div>
        )
    }
}

export default CreateFixture
