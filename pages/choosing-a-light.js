import React from "react";
import Nav from "../components/nav.js"
import Footer from "../components/footer.js"
import Header from "../components/header.js";
import SideBar from "../components/sidebar.js"
import Router from 'next/router'

class ChoosingALight extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.state = {
            query: ""
        }
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
        return (
            <div id="choosing-a-light" className="container">
                <Nav 
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    query={this.state.query}
                    currentPage="index"
                />
                <Header 
                    title={"What PAR level is right for me?"}
                    content={"PAR is short for Photosynthetically Active Radiation. It is an important factor for lighting when setting up a planted aquarium. The lighting level you choose will have a major effect on maintenance, plant growth, and algae growth. Select plants that do well in their respective PAR requirements."}
                />
                <div className="main">
                    <div className="content-wrap">
                        <h1>Which lighting is right for me?</h1>
                        <div className="media">
                            <img alt="" src="https://d2s6kvwb83n6p4.cloudfront.net/Peter_Kirwan_Mountainscape.jpg"/>
                        </div>
                        <div>
                            <p>
                                <strong>PAR</strong> is short for Photosynthetically Active Radiation.
                                It is an important factor for lighting when 
                                setting up a planted aquarium. The lighting level
                                you choose will have a major effect on maintenance,
                                plant growth, and algae growth. Select plants that do
                                well in their respective PAR requirements.
                            </p>
                            <p>
                                Aquarium lighting levels can be defined as <span> </span>
                                <a target="_blank" rel="noopener noreferrer" href="https://www.plantedtank.net/forums/10-lighting/184368-lighting-aquarium-par-instead-watts.html">
                                    [source]
                                </a>
                            </p>
                            <ul>
                                <li>
                                    <strong>Low Level</strong> - 15-30 micromols of PAR - CO2 is not needed, but is helpful to the plants. 
                                    *Low tech tanks are usually super low maintenance and can take awhile to fill in. Choose fast growing
                                    plants when going this route. Choosing only slow growing plants in a low tech tank will result in algae.
                                </li>
                                <li>
                                    <strong>Medium light</strong> - 35-50 micromols of PAR - CO2 may be needed to avoid too many nuisance algae problems.
                                    *Medium tech tanks is kind of tricky. Plants may grow a bit faster (even faster with CO2),
                                    but algae will also be growing faster. In my experience, having fast growing 
                                    plants and floating plants will deter algae here.
                                </li>
                                <li>
                                    <strong>High light</strong> - more than 50 micromols of PAR - pressurized CO2 is essential to avoid major algae problems.
                                    *High tech tanks tend to require more maintenance since plants grow quickly from CO2 injection. As a result,
                                    regular fertilizer dosing or nutrient rich substrate is required to keep the plants happy and keep algae
                                    at bay. This route will be the fastest way to a lush planted aquarium.
                                </li>
                            </ul>
                            <p>
                                What is considered low, medium, and high light may vary
                                to different hobbyists if you browse planted aquarium forums.
                                You can adjust your PAR needs in the search bar.
                                Regardless of light level, I would always recommend to plant heavy 
                                (especially if you are new to the hobby). It will help combat algae
                                growth which is pretty common when starting a new tank.
                            </p>
                        </div>
                    </div>
                    <SideBar/>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default ChoosingALight