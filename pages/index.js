import React from "react";
import Nav from "../components/nav.js"
import Footer from "../components/footer.js"
import validator from 'validator';
import SideBar from "../components/sidebar.js"
import axios from "axios"
import Header from "../components/header.js";
import Router from 'next/router'
import LoadingIcon from "../components/loadingicon.js"
import groupBy from 'lodash.groupby'
// Components Hierarchy
// -HOME
//    -SEARCH [user inputs]
//        -QUERY TEXT INPUT
//        -FILTER
//    -RESULTS
//    -Footer

function AllFixtures(props) {
    let {success} = props
    let displayFixtures = (success) ?
    (
        <div id="recent-fixtures">
            {props.fixturesMap}
        </div>
    )
    :
    (null)

    return (
        displayFixtures
    )
}

class Index extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);

        this._isMounted = false
        this.state = {
            query: "",
            max_length: "",
            min_length: "",
            max_spectrum: "",
            min_spectrum: "",
            max_watts: "",
            min_watts: "",
            par_level: "medium",
            par_height: 6,
            fixturesArray: [],
            resultsMessage: "",
            modalIsOpen: false,
            filterMessage: "",
            success: false
        }
    }

    openModal() {
        this.setState({ modalIsOpen: true });
    }

    closeModal() {
        this.setState({ modalIsOpen: false });
    }

    handleChange(event) {
        const eventType = event.target.name
        const updateQueryParams = (param) => {
            if(event.target.value.length === 0 || validator.isNumeric(event.target.value)) {
                this.setState({ [param]: event.target.value })
            } else {
                event.target.value = this.state[param]
            }
        }

        switch (eventType) {
            case "query":
                this.setState({ query: event.target.value })
                break
            case "low":
                this.setState({ par_level: event.target.value })
                    break
            case "medium":
                this.setState({ par_level: event.target.value })
                    break
            case "high":
                this.setState({ par_level: event.target.value })
                break
            case "min_length":
                updateQueryParams("min_length")
                break
            case "max_length":
                updateQueryParams("max_length")
                break
            case "min_spectrum":
                updateQueryParams("min_spectrum")
                break
            case "max_spectrum":
                updateQueryParams("max_spectrum")
                break
            case "min_power":
                updateQueryParams("min_watts")
                break
            case "max_power":
                updateQueryParams("max_watts")
                break
            default:
                console.log("error")
        }
    }

    async handleSubmit(event) {
        event.preventDefault()
        const eventType = event.target.name
        let href, as
        switch (eventType) {
            case "searchSubmit":
                Router.push({
                    pathname: '/search',
                    query: {query:this.state.query}
                })
               break
            case "add-height":
                if(this.state.par_height < 36) {
                    this.setState({ par_height: this.state.par_height + 3, filterMessage: ""})
                } else {
                    this.setState({ filterMessage: "Height cannot be greater 36 inches"})
                }
                break
            case "subtract-height":
                if(this.state.par_height > 3) {
                    this.setState({ par_height: this.state.par_height - 3, filterMessage: ""})
                } else {
                    this.setState({ filterMessage: "Height cannot be less than 3 inches"})
                }
                break
            default: console.log("error")
        }
    }

    async getFixtures() {
        try {
            const response = await axios.get(`/api/getFixtures?query=all`)
            if (response.status === 200) {
                const { numHits } = response.data
                const { fixturesArray } = response.data
                this.setState({
                    numHits, 
                    fixturesArray, 
                    success: true}) 
             } else {
                 this.setState({resultsMessage: "Error, database/server problems"})
             }
            return response
        } catch (error) {
            return error.response
        }
    }

    fixturesMap() {
        const fixturesArray = this.state.fixturesArray
        const grouped = groupBy(fixturesArray, "make")
        // console.log(JSON.stringify(grouped, null, 2))
        const yeet = []
        for (let make in grouped) {
            if(grouped.hasOwnProperty(make)) {
                let makeMap = mapFixtures(grouped[make])
                yeet.push(makeMap)
            }
        }
        return yeet
        function mapFixtures(fixtures) {
            return fixtures.map(function (element) {
                const fixtureTitle = `${element.make} ${element.model}`
                const fixtureLink = `/fixtures/${element.url_id}/${element.make}-${element.model.replace(/\s/g, "-")}`
                const imagesArray = element.images
                const imageURL = imagesArray[0]
                return (
                        <div key={element.url_id} className="fixture" data-id={element.url_id}>
                            <div>
                                <div style={{paddingBottom: "10px", fontSize: "1.3em", fontWeight: "600"}}>
                                    {fixtureTitle}
                                </div>
                                <div style={{width: "100%"}}>
                                    <a href={fixtureLink}>
                                        <img style={{width: "100%"}} src={imageURL} alt=""/>
                                    </a>
                                </div>
                                <div style={{paddingTop: "10px", display: "flex"}}>
                                    <a href={fixtureLink} style={{marginLeft: "auto", fontWeight: "600"}}><i className="far fa-hand-point-right"></i> View PAR Data</a>
                                </div>
                            </div>
                        </div>
                )
            })
        }
    }

    async componentDidMount() {
        this._isMounted = true
        if(this._isMounted) {
            await this.getFixtures()
        } 
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    render() {
        return (
            <div id="index" className="container">
                <Header
                />
                <Nav 
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    query={this.state.query}
                    currentPage="index"
                />
                <div className="main">
                    <div className="content-wrap">
                        <LoadingIcon
                            success = {this.state.success}
                        />
                        <AllFixtures
                            fixturesMap = {this.fixturesMap()}
                            success = {this.state.success}
                        />
                    </div>
                    <SideBar/>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default Index
