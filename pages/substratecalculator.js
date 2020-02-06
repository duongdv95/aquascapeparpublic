import React from "react";
import Nav from "../components/nav.js"
import Footer from "../components/footer.js"
import Header from "../components/header.js";
import validator from "validator";
import SideBar from "../components/sidebar.js"
import Router from 'next/router'

class SubstrateCalculator extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.state = {
            length: 0,
            width: 0,
            height: 0,
            requiredVolume: 0,
            selectedUnit: "imperial",
            literPerBag: 10,
            numberOfRequiredBags: "",
            numberOfBagsToBuy: "",
            conversionUnit: 2.54,
            query: "",
            isCustomSubstrate: false
        }
    }

    handleChange(event) {
        const eventType = event.target.name
        var requiredVolume
        var volume = (changedValue, dimension) => {
            let { length, width, height } = this.state
            let unchangedValues
            if (dimension === "length") {
                unchangedValues = width * height
            }
            if (dimension === "width") {
                unchangedValues = length * height
            }
            if (dimension === "height") {
                unchangedValues = length * width
            }
            return (Math.pow(this.state.conversionUnit, 3) * changedValue * unchangedValues / 1000).toFixed(2)
        }
        var updateLiterPerBag = (literPerBag, requiredVolume) => {
            if (validator.isNumeric(literPerBag + "") && literPerBag > 0) {
                let numberOfRequiredBags = (requiredVolume / literPerBag).toFixed(2)
                let numberOfBagsToBuy = Math.ceil(numberOfRequiredBags)
                this.setState({ numberOfRequiredBags, literPerBag, numberOfBagsToBuy })
            }
            if (literPerBag.length === 0) {
                this.setState({ literPerBag: "", numberOfRequiredBags: "", numberOfBagsToBuy: "" })
            }
            if (literPerBag === 0) {
                this.setState({ literPerBag: 0, numberOfRequiredBags: 0, numberOfBagsToBuy: 0 })
            }
        }
        switch (eventType) {
            case "query":
                this.setState({ query: event.target.value })
                break
            case "length":
                requiredVolume = volume(event.target.value, "length")
                this.setState({ length: event.target.value, requiredVolume })
                updateLiterPerBag(this.state.literPerBag, requiredVolume)
                break
            case "width":
                requiredVolume = volume(event.target.value, "width")
                this.setState({ width: event.target.value, requiredVolume })
                updateLiterPerBag(this.state.literPerBag, requiredVolume)
                break
            case "height":
                requiredVolume = volume(event.target.value, "height")
                this.setState({ height: event.target.value, requiredVolume })
                updateLiterPerBag(this.state.literPerBag, requiredVolume)
                break
            case "liter-per-bag":
                updateLiterPerBag(event.target.value, this.state.requiredVolume)
                break
            case "select-unit":
                let { length, width, height } = this.state
                this.setState({ selectedUnit: event.target.value })
                if (event.target.value === "metric") {
                    let requiredVolume = (Math.pow(1, 3) * length * width * height / 1000).toFixed(2)
                    this.setState({
                        conversionUnit: 1,
                        requiredVolume
                    })
                    updateLiterPerBag(this.state.literPerBag, requiredVolume)
                } else if (event.target.value === "imperial") {
                    let requiredVolume = (Math.pow(2.54, 3) * length * width * height / 1000).toFixed(2)
                    this.setState({
                        conversionUnit: 2.54,
                        requiredVolume
                    })
                    updateLiterPerBag(this.state.literPerBag, requiredVolume)
                }
                break
            case "substrate-type":
                let literPerBag = event.target.value
                let index = event.target.selectedIndex;
                let el = event.target.childNodes[index]
                if(el.getAttribute("name") === "custom-liter-per-bag") {
                    this.setState({isCustomSubstrate: true, literPerBag: 0})
                    updateLiterPerBag(0, this.state.requiredVolume)
                } else {
                    this.setState({isCustomSubstrate: false, literPerBag})
                    updateLiterPerBag(literPerBag, this.state.requiredVolume)
                }
                break
            default:
                console.log("error")
        }
    }

    handleSubmit(event) {
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

    render() {
        var litersRequired = `${this.state.requiredVolume} Liters`
        var litersPerBag = (this.state.isCustomSubstrate) ? 
        (
            <div className="child">
            <label>Liters of Substrate per Bag</label>
            <input name="liter-per-bag" type="number" value={this.state.literPerBag} placeholder="0" onChange={this.handleChange} />
            </div>
        )
        :
        (
            <div className="child calculator-result">
            <label>Liters of Substrate per Bag</label>
            <input name="liter-per-bag" type="number" placeholder="0" value={this.state.literPerBag} onChange={this.handleChange} disabled />
            </div>
        )
        return (
            <div id="substrate-calculator" className="container">
                <Nav 
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    query={this.state.query}
                    currentPage="index"
                />
                <Header 
                    title={"Aquarium Substrate Calculator"}
                    content={"Enter your tank dimensions in the calculator and it will tell you how much substrate you will need to reach your desired depth."}
                />
                <div className="main">
                    <div className="content-wrap">
                        <h1>
                            Aquarium Substrate Calculator
                        </h1>
                        <div className="media">
                            <img alt="" src="https://d2s6kvwb83n6p4.cloudfront.net/IAPLC_Forest-silence.jpg" />
                        </div>
                        <div className="child">
                            <label>Select Unit Preference</label>
                            <select name="select-unit" onChange={this.handleChange}>
                                <option value="imperial" >Imperial (inches)</option>
                                <option value="metric" >SI (cm)</option>
                            </select>
                        </div>
                        <div className="child">
                            <label>Aquarium Length</label>
                            <input name="length" type="number" placeholder="0" onChange={this.handleChange} />
                        </div>
                        <div className="child">
                            <label>Aquarium Width</label>
                            <input name="width" type="number" placeholder="0" onChange={this.handleChange} />
                        </div>
                        <div className="child">
                            <label>Desired Substrate Height</label>
                            <input name="height" type="number" placeholder="0" onChange={this.handleChange} />
                        </div>
                        <div className="child">
                            <label>Volume of Substrate Required (Liters)</label>
                            <input readOnly defaultValue={litersRequired} />
                        </div>
                        <div className="child">
                            <label>Substrate Type</label>
                            <select name="substrate-type" onChange={this.handleChange}>
                                <option value="10" >Ultum Nature Controsoil Substrate Extra Fine 10L</option>
                                <option value="5.3" >Fluval Plant & Shrimp Stratum</option>
                                <option value="5.3" >Flourite Black 15.4lb</option>
                                <option value="9" >ADA Aqua Soil Amazonia 9L</option>
                                <option value="8" >Mr Aqua Aquarium Soil Substrate 8L</option>
                                <option value="4.4" >UP Aqua Sand for Aquatic Plants</option>
                                <option name="custom-liter-per-bag" value="0" >CUSTOM - Enter your own liters per bag below</option>
                            </select>
                        </div>
                        {litersPerBag}
                        <div className="child calculator-result">
                            <label>Number of Bags Required (exact)</label>
                            <input type="number" readOnly value={this.state.numberOfRequiredBags} disabled/>
                        </div>
                        <div className="child calculator-result">
                            <label>Number of Bags to Purchase</label>
                            <input type="number" readOnly value={this.state.numberOfBagsToBuy} disabled/>
                        </div>
                        <div className="child">
                            <p>
                                This tool calculates how much substrate you need for
                                a planted aquarium. Enter the length and width and desired
                                height of the substrate. Select a substrate type or enter the liters
                                per bag of your desired substrate. Typically, the substrate height
                                ranges between 2-4 inches (5 to 10 cm). If a sloped substrate is desired, enter the average
                                of the greatest and lowest height of the substrate.
                                </p>
                        </div>
                        <div id="first-image" className="media">
                            <img alt="" src="https://d2s6kvwb83n6p4.cloudfront.net/Jungle_style_aquascape.jpg" />
                        </div>
                        <div className="child">
                            <p>
                                The volumes from the substrate types in this calculator are gathered
                                from product descriptions, manufacturer websites, and/or personal
                                measurements of the product. They can be found below.
                                </p>
                        </div>
                        <div className="child" id="substrate-calculator-links">
                            <ul>
                                <li>
                                    <a href="https://amzn.to/2JWhg6u" target="_blank" rel="noopener noreferrer">Ultum Nature Controsoil Substrate Extra Fine 10L</a>
                                    - Aquarium soil from Japan. Keeps pH of alkaline water
                                    below 7. Advertised not to leech excessive ammonia.

                                        </li>
                                <li>
                                    <a href="https://amzn.to/2JPYUUv" target="_blank" rel="noopener noreferrer">Fluval Plant & Shrimp Stratum</a>
                                    - Slightly reduces pH. May not buffer water for long term.
                                    Not as nutritionally rich as some higher tier soils
                                    but can supplemented easily with root tabs. More
                                    affordable than high tier soils.
                                        </li>
                                <li>
                                    <a href="https://amzn.to/3ajbp7z" target="_blank" rel="noopener noreferrer">ADA Aqua Soil Amazonia Normal 9L</a>
                                    - One of the most popular soils in the planted aquarium hobby.
                                    Includes key plant nutrients, uniform size, durable, lowers pH
                                    and water hardness. Temporary downside is leeching excess ammonia when
                                    initially starting out. Do several big water changes initially and plant heavy.
                                        </li>
                                <li>
                                    <a href="https://amzn.to/2SosTXl" target="_blank" rel="noopener noreferrer">Seachem Flourite Black</a>
                                    - Very fine granules, can be messy to work with. Easy to plant in.
                                    Porous clay substrate is good at nutrient absorption.
                                        </li>
                                <li>
                                    <a href="https://amzn.to/378DX1x" target="_blank" rel="noopener noreferrer">Mr. Aqua Aquarium Soil Substrate 8L</a>
                                    - Nutritionally complete and economical alternative to aquasoil. 8L bag has
                                    more value than buying 1L bags.
                                        </li>
                                <li>
                                    <a href="https://amzn.to/2JReyyT" target="_blank" rel="noopener noreferrer">UP AQUA Sand for Aquatic Plants</a>
                                    - Substrate appears shiny from baking during manufacturing. Not ideal substrate if you
                                    prefer a more natural look. Advertised to be durable and drop pH to 6.5.
                                        </li>
                            </ul>
                        </div>
                    </div>
                    <SideBar/>
                </div>
                <Footer />
            </div>
        )
    }
}

export default SubstrateCalculator