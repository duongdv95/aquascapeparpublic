import React from "react";
import Nav from "../components/nav.js"
import Footer from "../components/footer.js"
import Header from "../components/header.js";
import SideBar from "../components/sidebar.js"
import Router from 'next/router'

class TestingMethod extends React.Component {
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
            <div id="testing-method" className="container">
                <Nav 
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    query={this.state.query}
                    currentPage="index"
                />
                <Header 
                    title={"PAR Testing Method"}
                    description={"Fixtures are tested for PAR values using the Seneye PAR meter and put together on a table."}
                />
                <div className="main">
                    <div className="content-wrap">
                        <h1>Testing Method</h1>
                        <div>
                            <p>
                                I measure PAR values using the Seneye PAR meter. More information on this meter can be found <span> </span>
                                <a href="https://www.amazon.com/gp/product/B005HR11W2/ref=as_li_qf_asin_il_tl?ie=UTF8&tag=danield04-20&creative=9325&linkCode=as2&creativeASIN=B005HR11W2&linkId=845a2ca392d3b1f92dcd5a6b809d3cde" target="_blank" rel="noopener noreferrer">here</a> (Amazon Affiliate Link).
                            </p>
                            <h3 style={{marginBottom: "0"}}>
                                UPDATE (November 2019) - Improved method!
                            </h3>
                            <p style={{marginTop: "0"}}>
                                I 3D printed a measuring tool to hold my Seneye PAR meter. This 
                                helps me better test aquarium fixtures, especially under water. 
                                Check out the video below for an example of how I test it!
                                <iframe title="new par testing method" width="100%" height="315" src="https://www.youtube.com/embed/c63NBsmglZw" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            </p>
                            <h3 style={{marginBottom: "0"}}>
                                August 2019 - November 2019
                            </h3>
                            <p style={{marginTop: "0"}}>
                                For small fixtures, I lay them sideways. On a piece of white foam board, I mark measurements ranging from 3 inches to however many inches incremented by 3 inches.
                                Next, I use the PAR meter and measure the values from the center of the fixture to get the PAR values for depth of 0 inches from the center of the fixture.
                                Finally, using a second piece of white foam board with 3" increments marked, I measure the PAR values 3 inches incremented from the depth of the center.
                            </p>
                            <p>
                                For larger fixtures, I tie a string to the center of the fixture and mark 3 inch increments for the height. This prevents the light from being obstructed.
                                I measure the PAR with depth of 0 inches from the center of fixture. Next, I use a foam board with pre-marked increments of 3" to measure various measurements
                                from the depth of the center incremented by 3 inches. 
                            </p>
                            <p>
                                I try to be as accurate as I can. Fixtures were measured in air and PAR would be slightly different water. 
                                If you have a method that works better please let me know via email!
                                Also, if you happen to have PAR data for any particular fixture that you believe is more accurate,
                                please shoot me an email with the information and I can update/add the fixture to the site. Thank you!
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

export default TestingMethod