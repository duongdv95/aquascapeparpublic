import React, { useState } from "react";
import axios from "axios"
import Nav from "../components/nav.js"
import Footer from "../components/footer.js"
import zip from "lodash.zip"
import Header from "../components/header.js";
import Router from 'next/router'
import SideBar from "../components/sidebar.js"
import LoadingIcon from "../components/loadingicon.js"
import { useSwipeable } from "react-swipeable";
import marked from "marked";

function processPARData(PARData) {
    let PARArrayGroupedByDepth = []
    let tempGroupHeight = []
    let depthArray = []
    let heightObj = {}
    for(var depthFromCenter in PARData) {
        if(PARData.hasOwnProperty(depthFromCenter)) {
            let heightData = PARData[depthFromCenter].height
            depthArray.push(depthFromCenter)
            tempGroupHeight = []
            for(var height in heightData) {
                if(heightData.hasOwnProperty(height)) {
                    if(!(height in heightObj)) {
                        heightObj[height] = true
                    }
                    tempGroupHeight.push(heightData[height])
                }
            }
        }
        PARArrayGroupedByDepth.push(tempGroupHeight)
    }
    return {PARArrayGroupedByDepth, heightObj, depthArray}
}

function saveHeightAndDepthIndexes(PARTableArray, columnCount, rowCount) {
    let heightIndexes = {}
    let depthIndexes = {}
    for(var i = 0; i < rowCount*columnCount; i+=columnCount) {
        if(PARTableArray[i] !== null) {
            heightIndexes[i] = true;
        }
    }
    for(var j = PARTableArray.length - 1; j >= PARTableArray.length - columnCount + 1; j--) {
        depthIndexes[j] = true
    }
    return {heightIndexes, depthIndexes}
}

function getHeightAxisArray(heightObj) {
    let heightAxisArray = []
    for(let height in heightObj) {
        if(heightObj.hasOwnProperty(height)) {
            heightAxisArray.push(height)
        }
    }
    return heightAxisArray
}

function getFinalPARTableArrayAndRowColumnCount(PARArrayGroupedByDepth, heightAxisArray, depthArray) {
    let PARTableArray = []
    PARArrayGroupedByDepth.splice(0, 0, heightAxisArray)
    let PARArrayGroupedByHeight = zip(...PARArrayGroupedByDepth)
    PARArrayGroupedByHeight.push([null].concat(depthArray))
    PARTableArray = PARArrayGroupedByHeight.flat()
    return {PARTableArray}
}

function countRowsAndColumns(PARTableArray) {
    let columnCount = 1
    let rowCount = 1
    let nullIndex = 0
    for(let i = 0; i < PARTableArray.length; i++) {
        if(PARTableArray[i] === null) {
            nullIndex = i
            break
        }
        if(typeof PARTableArray[i] === "string") {
            rowCount ++
        }
    }
    for(let i = PARTableArray.length - 1; i > nullIndex; i--) {
        columnCount++
    } 
    return {rowCount, columnCount}
}

function PARTable(props) {
    let PARData = props.PAR.depth_from_center
    let {PARArrayGroupedByDepth, heightObj, depthArray} = processPARData(PARData)
    let heightAxisArray = getHeightAxisArray(heightObj)
    let {PARTableArray} = getFinalPARTableArrayAndRowColumnCount(PARArrayGroupedByDepth, heightAxisArray, depthArray)
    let {rowCount, columnCount} = countRowsAndColumns(PARTableArray) 
    let {heightIndexes, depthIndexes} = saveHeightAndDepthIndexes(PARTableArray, columnCount, rowCount)
    const displayPARTable = PARTableArray.map(function(element, index) {
        let classes = ""
        let appendInch = ""
        if(typeof element === "number") {
            classes += "par-item "
        }
        if(index in heightIndexes) {
            classes += "par-height-axis"
            appendInch += `"`
        }
        if(index in depthIndexes) {
            classes += "par-depth-axis"
            appendInch += `"`
        }
        return (
            <div className={classes} key={index}>
                {element}{appendInch}
            </div> 
        )
    })
    const columnStyle = {
        gridTemplateColumns: `repeat(2, minmax(auto, 2em)) repeat(${columnCount - 1}, auto)`,
        gridColumn: `2/3`
    }
    // const PARTableStyle = {
    //     gridTemplateColumns: `1fr minmax(auto, 20em) 1fr`
    // }
    const heightAxisStyle = {
        gridColumn:'1/2', 
        gridRow:`2/${rowCount + 1}`
    }
    const depthAxisStyle = {
        gridColumn:`3/${columnCount + 2}`, 
        gridRow:`${rowCount + 2}/${rowCount + 3}`
    }
    const headerStyle = {
        gridRow:`1/2`,
        gridColumn:`1/${columnCount + 2}`
    }
    return(
        <div id="par-table">
        {/* <div id="par-table" style={PARTableStyle}> */}
            <div id="nested-grid" style={columnStyle}>
                <div id="par-table-header" style={headerStyle}>
                    PAR Data
                </div>
                <div id="height-axis-label" style={heightAxisStyle}>
                    <span>
                        Height
                    </span>
                </div>
                <div id="depth-axis-label" style={depthAxisStyle}>
                    <span>
                        Depth from Center of Fixture
                    </span>
                </div>
                <div style={{gridColumn:'1/2', gridRow:`${rowCount + 1}/${rowCount + 2}`}}>
                </div>
                {displayPARTable}
            </div>
        </div>
    )
}

function AxisToolTip() {
    const [toolTipIsOpen, setToolTipIsOpen] = useState(false)
    const toggle = (toolTipIsOpen) ? "fas fa-minus" : "fas fa-plus"
    const display = (toolTipIsOpen) ? {display: "block"} : {display: "none"}
    return (
        <div id="axis-tool-tip">
        <div className="tool-tip-header">
            <div onClick={() => setToolTipIsOpen(!toolTipIsOpen)}>
                Axis Diagram
            </div>
            <div onClick={() => setToolTipIsOpen(!toolTipIsOpen)}>
                <i className={toggle}></i>
            </div>
        </div>
        <div style={display} id="diagram">
        </div>
    </div>
    )
}

function FixtureData(props) {
    let {length, width, height, max_mounting_width} = props.specifications.dimensions_inch
    let notes = props.notes
    let product_links = props.product_links
    let productLinksArray = []
    function convertToCM(value) {
        let convertedToCM = (value/0.39370).toFixed(1);
        return convertedToCM
    }
    let lengthCM = convertToCM(length)
    let widthCM = convertToCM(width)
    let heightCM = convertToCM(height)
    let max_mounting_widthCM = convertToCM(max_mounting_width)
    let specifications = props.specifications
    for(let link in product_links) {
        productLinksArray.push(link)
    }
    let displayBuyLinks = productLinksArray.map((element) => {
        let seller
        if(element === "amazon") {
            seller = "Amazon Affiliate Link"
        }
        if(element === "ebay") {
            seller = "Ebay Affiliate Link"
        }
        return (
            <li key={element}>
                <a href={product_links[element]} target="_blank" rel="noopener noreferrer">{seller}</a>
            </li>
        )
    })
    function rawMarkup(text) {
        let rawMarkup = marked(text)
        return { __html: rawMarkup }  
    }
    
    return ( 
        <div id="fixture-data">
            <div className="specifications">
                <div>
                    Where To Buy
                </div>
                <div>
                    <ul>
                        {displayBuyLinks}
                    </ul>
                </div>
                <div>
                    Description
                </div>
                <div>
                    {specifications.description}
                </div>
                <div>
                    Notes
                </div>
                <div>
                    <span dangerouslySetInnerHTML= {
                        rawMarkup(notes)
                    }/>
                </div>
                <div>
                    Standard Dimensions
                </div>
                <div>
                    {length}" x {width}" x {height}" (L x W x H)
                </div>
                <div>
                    Metric Dimensions
                </div>
                <div>
                    {lengthCM}cm x {widthCM}cm x {heightCM}cm (L x W x H)
                </div>
                <div>
                    Max Mounting Width
                </div>
                <div>
                    {max_mounting_width}" / {max_mounting_widthCM}cm
                </div>
                <div>
                    Spectrum
                </div>
                <div>
                    {specifications.spectrum} Kelvin
                </div>
                <div>
                    Power
                </div>
                <div>
                    {specifications.power_watts} watts
                </div>
                <div>
                    Testing Method
                </div>
                <div>
                    <span dangerouslySetInnerHTML= {
                    rawMarkup(`PAR tested using Seneye PAR meter unless otherwise noted in the notes section. Testing process is documented [here](/testing-method)`)
                    }/>
                </div>
            </div>
        </div>
    )
}

function FixtureHeader(props) {
    let {make, model} = props
    let fixtureHeader = `${make} ${model}`.toUpperCase()
    return (
        <div className="fixture-header">
            <h1>
                {fixtureHeader}
            </h1>
        </div>
    )
}

function FixtureImage(props) {
    const handlers = useSwipeable({
        onSwipedLeft: () => props.goBack(),
        onSwipedRight: () => props.goForward(),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });
    const imageCarousel = props.images.map(function(element, index) {
        const imageClass = (props.currentImage === index) ? "image-container selected" : "image-container" 
        return (
            <img className={imageClass} src={element} alt="" key={index}/>
        )
    })
    // const imageCarousel = props.images.map(function(element, index) {
    //     const imageClass = (props.currentImage === index) ? "image-container selected" : "image-container" 
    //     return (
    //         <div
    //         className={imageClass}
    //         style={{backgroundImage: `url(${element})`}}
    //         key={index}
    //         >
    //         </div>
    //         <img className={imageClass} src={element} alt=""/>
    //     )
    // })
    const carouselInfo = 
    (
        <div id="carousel-info">
            image {props.currentImage + 1} of {props.images.length}
        </div>
    )
    return (
        <div id="fixture-image" {...handlers}>
            <div style={{width: '100%', marginBottom: '-35px'}}>
                {imageCarousel}
                {carouselInfo}
                <div className="controls">
                    <button className="controls__button" onClick={props.goForward}>
                        <i className ="fas fa-chevron-left" />
                    </button>
                    <button className="controls__button" onClick={props.goBack}>
                        <i className ="fas fa-chevron-right" />
                    </button>
                </div>
            </div>
    
        </div>
    )
}

class Info extends React.Component {
    renderPARTable() {
        return (
            <PARTable
            PAR = {this.props.PAR}
            />
        )
    }

    renderFixtureData() {
        return (
            <FixtureData
            specifications = {this.props.specifications}
            notes = {this.props.notes}
            product_links = {this.props.product_links}
            images = {this.props.images}
            currentImage = {this.props.currentImage}
            goBack = {this.props.goBack}
            goForward = {this.props.goForward}
            />
        )
    }

    renderFixtureHeader() {
        return (
            <FixtureHeader
            make = {this.props.make}
            model = {this.props.model}
            />
        )
    }

    renderImage() {
        return (
            <FixtureImage
            images = {this.props.images}
            currentImage = {this.props.currentImage}
            goBack = {this.props.goBack}
            goForward = {this.props.goForward}
            />
        )
    }

    render() {
        let loading = this.props.loading
        let info = (!loading) ?
            (
                    <div className="fixture-info">
                        {this.renderFixtureHeader()}
                        {this.renderPARTable()}
                        <AxisToolTip/>
                        {this.renderImage()}
                        {this.renderFixtureData()}
                    </div>
            ) : null

        return (
            info
        )
    }
}

class Fixtures extends React.Component {
    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this._isMounted = false

        this.state = {
            query: "",
            desiredDepth: "",
            lightLevel: "",
            maxLength: "",
            minLength: "",
            maxSpectrum: "",
            minSpectrum: "",
            maxPower: "",
            minPower: "",
            fixturesArray: [],
            numResults: "",
            resultsMessage: "",
            images: [],
            loading: true,
            make: "",
            model: "", 
            notes: "", 
            product_links: "", 
            url_id: "", 
            specifications: "", 
            PAR: "",
            currentImage: 0,
            fixtureID: props.fixtureID
        }
    }

    static async getInitialProps({ query }) {
        let props = {fixtureID: query.id}
        return props
    }

    handleChange(event) {
        const eventType = event.target.name
        switch (eventType) {
            case "query":
                this.setState({ query: event.target.value })
                break
            default:
                console.log("error")
        }
    }

    async handleSubmit(event) {
        event.preventDefault()
        const eventType = event.target.name
        switch (eventType) {
            case "searchSubmit":
                Router.push({
                    pathname: '/search',
                    query: {query:this.state.query}
                })
               break

            default: console.log("error")
        }
    }
    
    async getFixture() {
        let fixtureID = this.state.fixtureID
        try {
            const response = await axios.get(`/api/getFixtures?id=${fixtureID}`)
            if (response.status === 200) {
                let fixtureData = response.data.fixturesArray[0]
                let {make, model, notes, product_links, url_id, specifications, PAR, images} = fixtureData
                images.forEach((src) => {
                    var image = new Image()
                    image.src = src
                })
                this.setState({make, model, notes, product_links, url_id, specifications, PAR, loading: false, images})

             } else {
                 this.setState({resultsMessage: "Error, database/server problems"})
             }
            return response
        } catch (error) {
            return error.response
        }
    }

    async componentDidMount() {
        this._isMounted = true
        if(this._isMounted) {
            await this.getFixture()
        } 
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    goBack = () => {
        const images = this.state.images
        const currentImage = this.state.currentImage
        currentImage >= images.length - 1 ? this.setState({ currentImage: 0 }) : this.setState({ currentImage: currentImage + 1 })    
    }
    
    goForward = () => {
        const images = this.state.images
        const { currentImage } = this.state
        currentImage === 0 ? this.setState({ currentImage: images.length - 1 }) : this.setState({ currentImage: currentImage - 1 })
    }

    render() {
        const title = `${this.state.make} ${this.state.model} par data`.toUpperCase()
        return (
            <div id="fixture" className="container">
                <Header
                title = {title}
                />
                <Nav 
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    query={this.state.query}
                    openModal={this.openModal}
                    currentPage="index"
                />
                <div className="main">
                    <div className="content-wrap">
                        <LoadingIcon
                                success = {!this.state.loading}
                            />
                        <Info
                            make={this.state.make}
                            model={this.state.model}
                            notes={this.state.notes}
                            product_links={this.state.product_links}
                            url_id={this.state.url_id}
                            specifications={this.state.specifications}
                            PAR={this.state.PAR}
                            loading={this.state.loading}
                            images={this.state.images}
                            goBack={this.goBack}
                            goForward={this.goForward}
                            currentImage={this.state.currentImage}
                        />
                    </div>
                    <SideBar/>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default Fixtures
