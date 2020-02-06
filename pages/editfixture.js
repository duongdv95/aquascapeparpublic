import React from "react";
import axios from "axios"
import Nav from "../components/nav.js"
import Footer from "../components/footer.js"
import validator from "validator"
import Header from "../components/header.js"
import Router from "next/router"

function FixtureData(props) {
    let {length, width, height, max_mounting_width} = props.specifications.dimensions_inch
    let notes = props.notes
    let product_links = props.product_links
    let productLinksArray = ["amazon", "ebay"]
    let specifications = props.specifications
    let dimensions = `${length},${width},${height}`
    let depth_from_center = props.depth_from_center
    let PAR = props.PAR
    let displayDepth = depth_from_center.map((element) => {
        let placeholder = `PAR at height 3", 6", 9", etc`
        let PARValues = null
        if(props.generated) {
            let PARArray = []
            for(let key in PAR.depth_from_center[element].height) {
                PARArray.push(PAR.depth_from_center[element].height[key])
            }
            PARValues = PARArray.join(",")
        }
        return (
            <React.Fragment key={element}>
                <div>
                    <label>Enter PAR at depth from center: {element}"</label>
                    <input
                    name="par"
                    type="text"
                    depth={element}
                    placeholder={placeholder}
                    onChange={props.handleChange}
                    defaultValue={PARValues}
                    />
                </div>
            </React.Fragment>
        )
    })
    let url_id = `/admin/imageupload/${props.url_id}`
    let editDescription = (
        <div>
            <textarea name="description" onChange={props.handleChange} defaultValue={specifications.description}/>
        </div>
    )
    let editLinks = productLinksArray.map((element) => {
        return (
            <div key={element}>
                {element}
                <input name={element} type="text" defaultValue={product_links[element]} onChange={props.handleChange}/>
            </div>
        )
    })
    return ( 
        <div id="fixture-data">
            <div>
                <h1 className="header">
                    Make and Model
                </h1>
                <div>
                    Make
                    <input type="text" name="make" onChange={props.handleChange} defaultValue={props.make}/>
                </div>
                <div>
                    Model
                    <input type="text" name="model" onChange={props.handleChange} defaultValue={props.model}/>
                </div>
            </div>
            <div className="par-table">
                <h1 className="header">
                    PAR Table
                </h1>
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
            </div>
            <div className="buy-links">
                <h1 className="header">
                    Where To Buy
                </h1>
                {editLinks}
            </div>
            <div className="description">
                <h1 className="header">
                    Description
                </h1>
                {editDescription}
            </div>
            <div className="specifications">
                <h1 className="header">
                    Specifications
                </h1>
                <div>
                    Standard Dimensions: 
                    <input name="dimensions" type="text" onChange={props.handleChange} defaultValue={dimensions}/> (L x W x H) inches
                </div>
                <div>
                    Max Mounting Width: 
                    <input name="max_mounting_width" type="text" onChange={props.handleChange} defaultValue={max_mounting_width}/> inches
                </div>
                <div>
                    Spectrum: <input name="spectrum" type="text" onChange={props.handleChange} defaultValue={specifications.spectrum}/> Kelvin
                </div>
                <div>
                    Power: <input name="power" type="text" onChange={props.handleChange} defaultValue={specifications.power_watts}/> watts
                </div>
            </div>
            <div className="testing-method">
                <h1 className="header">
                    Testing Method
                </h1>
                All fixtures are tested using Seneye PAR meter unless otherwise
                stated in the notes. The testing process is documented 
                <span> </span><a href="/">here</a>.
            </div>
            <div className="notes">
                <h1 className="header">
                    Notes
                </h1>
                <textarea name="notes" defaultValue={notes} onChange={props.handleChange}/>
            </div>
            <div className="images">
                <h1 className="header">
                    Edit Images
                </h1>
                <a href={url_id} target="_blank" rel="noopener noreferrer">Edit</a>
            </div>
            <button name="edit-submit" onClick={props.handleSubmit}>Submit</button>
            <div>
                {props.message}
            </div>
        </div>
    )
}

class Info extends React.Component {
    renderFixtureData() {
        return (
            <FixtureData
            specifications = {this.props.specifications}
            notes = {this.props.notes}
            product_links = {this.props.product_links}
            PAR = {this.props.PAR}
            depth_from_center = {this.props.depth_from_center}
            handlePARChange = {this.props.handlePARChange}
            handleChange = {this.props.handleChange}
            handleSubmit = {this.props.handleSubmit}
            generated = {this.props.generated}
            url_id = {this.props.url_id}
            make = {this.props.make}
            model = {this.props.model}
            message = {this.props.message}
            />
        )
    }

    render() {
        let loading = this.props.loading
        let info = (!loading) ?
            (
                    <div className="fixture-info">
                        {this.renderFixtureData()}
                    </div>
            ) : null

        return (
            info
        )
    }
}

class EditFixture extends React.Component {
    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
        this.handlePARChange = this.handlePARChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this._isMounted = false

        this.state = {
            loading: true,
            make: "",
            model: "", 
            notes: "", 
            product_links: "", 
            url_id: props.url_id || "", 
            specifications: "", 
            PAR: "",
            depth_from_center: [0],
            generated: true,
            amazon: "",
            ebay: "",
            max_mounting_width: "",
            spectrum: "",
            power_watts: "",
            dimensions: "",
            errorMessage: "",
            message: "",
            isLoggedIn: false
        }
    }

    handleChange(event) {
        const eventType = event.target.name
        switch (eventType) {
            case "par":
                let PAR = this.formatPAR({PAR: this.state.PAR, event})
                this.setState({ PAR })
                break
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

            case "query":
                this.setState({ query: event.target.value })
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

    handlePARChange(event) {
        const eventType = event.target.name
        let depth_from_center = this.state.depth_from_center
        let lastInArray = depth_from_center[depth_from_center.length - 1]
        let PAR = this.state.PAR
        switch (eventType) {
            case "add-depth":
                depth_from_center.push(parseInt(lastInArray) + 3)
                this.setState({ generated: false })
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
        if ((validator.isEmpty(state.max_mounting_width)) || !(validator.isNumeric(state.max_mounting_width))) {
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
                specifications.dimensions_inch.length = dimensionsArray[i]
            }
            if (i === 1) {
                specifications.dimensions_inch.width = dimensionsArray[i]
            }
            if (i === 2) {
                specifications.dimensions_inch.height = dimensionsArray[i]
            }
        }
        specifications.spectrum = state.spectrum
        specifications.description = state.description
        specifications.power_watts = state.power_watts
        specifications.dimensions_inch.max_mounting_width = state.max_mounting_width
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

    editFixture(fixtureData) {
        try {
            const response = axios.put("/api/editFixture", fixtureData, { headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}})
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
        switch (eventType) {
            case "searchSubmit":
                Router.push({
                    pathname: '/search',
                    query: {query:this.state.query}
                })
               break
            case "edit-submit": 
                var submit = window.confirm('Are you sure you want to submit data?')
                if(submit){
                    let isDataCorrectlyFormatted = this.verifyFixtureData(state)
                    if (isDataCorrectlyFormatted.success) {
                        fixtureData = this.formatFixtureData(state)
                        fixtureData.url_id = this.state.url_id
                        response = await this.editFixture(fixtureData)
                        if(response.data.success) {
                            this.setState({ message: "Fixture updated on dynamodb."})
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
                } else {

                }

                break
            default: console.log("error")
        }
    }
    
    static async getInitialProps({ query }) {
        return {url_id: query.id}
    }

    async getFixture() {
        let fixtureID = this.state.url_id
        try {
            const response = await axios.get(`/api/getFixtures?id=${fixtureID}`)
            if (response.status === 200) {
                let fixtureData = JSON.stringify(response.data.fixturesArray[0])
                let {make, model, notes, product_links, url_id, specifications, PAR} = JSON.parse(fixtureData)
                let depth_from_center = []
                for(let depth in PAR.depth_from_center) {
                    depth_from_center.push(depth)
                }
                for(let key in product_links) {
                    if (key === "amazon") {
                        this.setState({ amazon: product_links[key] })
                    }
                    if (key === "ebay") {
                        this.setState({ ebay: product_links[key] })
                    }
                }
                let {height, width, length} = specifications.dimensions_inch
                this.setState({
                    power_watts: specifications.power_watts + "", 
                    spectrum: specifications.spectrum + "",
                    max_mounting_width: specifications.dimensions_inch.max_mounting_width + "",
                    dimensions: `${length},${width},${height}`,
                    description: specifications.description})
                this.setState({make, model, notes, product_links, url_id, specifications, PAR, loading: false, depth_from_center})

             } else {
                 this.setState({resultsMessage: "Error, database/server problems"})
             }
            return response
        } catch (error) {
            return error.response
        }
    }

    async checkToken(token) {
        if(token) {
            const AuthStr = `Bearer ${token}`
            let response = await axios.get('/api/checktoken', { headers: {Authorization: AuthStr}})
            return response
        } else {
            return {data: {success: false}}
        }
    }

    async componentDidMount() {
        this._isMounted = true
        if(this._isMounted) {
            let token = localStorage.getItem("token") || ""
            let response = await this.checkToken(token)
            if(response.data.success) {
                this.setState({ isLoggedIn: true})
                this.getFixture()
            } 
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }
    render() {
        let displayEditfixture = (this.state.isLoggedIn) ? (
            <React.Fragment>
                <Info
                make={this.state.make}
                model={this.state.model}
                notes={this.state.notes}
                product_links={this.state.product_links}
                url_id={this.state.url_id}
                specifications={this.state.specifications}
                PAR={this.state.PAR}
                loading={this.state.loading}
                handlePARChange = {this.handlePARChange}
                depth_from_center = {this.state.depth_from_center}
                handleChange = {this.handleChange}
                handleSubmit = {this.handleSubmit}
                generated = {this.state.generated}
                message = {this.state.message}
            />
            <button><a href="/admin" >Back to admin</a></button>
            </React.Fragment>
        ) : (
            <div>
                Unauthorized
            </div>
        )
        return (
            <div id="edit-fixture" className="container">
                <Header/>
                <Nav
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    query={this.state.query}
                    currentPage="index"
                    isDisabled={true}
                />
                <div className="main">
                    <div className="content-wrap">
                        {displayEditfixture}
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default EditFixture
