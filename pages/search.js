import React from "react";
import axios from "axios"
import Nav from "../components/nav.js"
import Footer from "../components/footer.js"
import validator from 'validator';
import Router from 'next/router'
import { withRouter } from "next/router";
import Header from "../components/header.js";
import SideBar from "../components/sidebar.js"
import LoadingIcon from "../components/loadingicon.js"

// Components Hierarchy
// -HOME
//    -SEARCH [user inputs]
//        -QUERY TEXT INPUT
//        -FILTER
//    -RESULTS
//    -Footer

class Results extends React.Component {
    render() {
        const fixturesMap = this.props.fixturesMap
        const numHits = this.props.numHits
        const path = this.props.path
        const pageNum = this.props.pageNum
        const query = this.props.query
        const displayFixtures = () => {
            return (
                <div id="fixture-results">
                    <div style={{padding:"0 1em 2em 1em"}}>
                        <h1 style={{fontSize: "1.5rem"}}>Search Results for {query}</h1>
                        <div>
                            {numHits} fixtures found
                        </div>
                    </div>
                    {fixturesMap}
                </div>
            )
        }
        const pagination = (numHits) => {
            let numPages = Math.ceil(numHits / 5)
            let pages = []
            let current = ""
            let pageNumber
            for (var i = 1; i <= numPages; i++) {
                let page = "/search?" + path.replace(/\s/g, "+") + `&page=${i}`
                pageNumber = (<a href={page}>
                    {i}
                </a>
                )
                if (parseInt(pageNum) === i) {
                    current = "current"
                    pageNumber = (<span>
                        {i}
                    </span>)
                }
                pages.push((
                    <div key={i} className={"page-number " + current}>
                        {pageNumber}
                    </div>
                ))
                current = ""
            }
            return pages
        }

        const displayResults = (this.props.success) ?
            (
                <div>
                    {displayFixtures()}
                    <div className="pagination">
                        <div className="page-numbers">
                            {pagination(numHits)}
                        </div>
                    </div>
                </div>
            )
            :
            null
        return (
            displayResults
        )
    }
}

class Search extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this._isMounted = false
        this.state = {
            query: props.query || "",
            max_length: props.max_length || "",
            min_length: props.min_length || "",
            max_spectrum: props.max_spectrum || "",
            min_spectrum: props.min_spectrum || "",
            max_watts: props.max_watts || "",
            min_watts: props.min_watts || "",
            par_level: props.par_level || "medium",
            par_height: props.par_height || 6,
            fixturesArray: [],
            resultsMessage: "",
            modalIsOpen: false,
            filterMessage: "",
            numHits: 0,
            originalQuery: props.originalQuery || "",
            path: props.path || "",
            pageNum: props.pageNum || 1,
            success: false,
            queryRequest: props.queryRequest || "",
            router: props.router
        }
    }

    static async getInitialProps({ req, query }) {
        let queryArray = []
        let queryArrayWithoutPage = []
        let props = {}
        let queryRequest = ""
        let queryPathWithoutPage = ""
        let queries = query
        for (var queryTerm in queries) {
            let parameter = queries[queryTerm]
            queryArray.push(`${queryTerm}=${parameter}`)
            if (queryTerm !== "page") {
                queryArrayWithoutPage.push(`${queryTerm}=${parameter}`)
            }
            if (queryTerm === "page") {
                props.pageNum = parameter
            }
            if (queryTerm === "par_level") props.par_level = parameter
            if (queryTerm === "par_height") props.par_height = parseInt(parameter)
            if (queryTerm === "max_length") props.max_length = parameter
            if (queryTerm === "min_length") props.min_length = parameter
            if (queryTerm === "max_spectrum") props.max_spectrum = parameter
            if (queryTerm === "min_spectrum") props.min_spectrum = parameter
            if (queryTerm === "max_watts") props.max_watts = parameter
            if (queryTerm === "min_watts") props.min_watts = parameter
        }
        queryRequest = queryArray.join("&")
        queryPathWithoutPage = queryArrayWithoutPage.join("&")
        props.path = `${queryPathWithoutPage}`
        props.queryRequest = queryRequest
        props.query = queries.query
        props.originalQuery = queries
        return props
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
            if (event.target.value.length === 0 || validator.isNumeric(event.target.value)) {
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
                this.setState({
                    queryRequest: `query=${this.state.query}`,
                    originalQuery: { query: this.state.query }
                })
                href = `/search?query=${this.state.query.replace(/\s/g, "+")}`
                as = href
                Router.push(href, as, { shallow: true });
                break
            case "query-clear":
                this.setState({
                    queryRequest: `query=${this.state.query}`,
                    originalQuery: { query: this.state.query }
                })
                href = `/search?query=${this.state.query.replace(/\s/g, "+")}`
                as = href
                Router.push(href, as, { shallow: true });
                break
            case "add-height":
                if (this.state.par_height < 36) {
                    this.setState({ par_height: this.state.par_height + 3, filterMessage: "" })
                } else {
                    this.setState({ filterMessage: "Height cannot be greater 36 inches" })
                }
                break
            case "subtract-height":
                if (this.state.par_height > 3) {
                    this.setState({ par_height: this.state.par_height - 3, filterMessage: "" })
                } else {
                    this.setState({ filterMessage: "Height cannot be less than 3 inches" })
                }
                break
            default: console.log("error")
        }
    }

    async getFixtures() {
        let queryRequest = this.state.queryRequest
        try {
            const response = await axios.get(`/api/getFixtures?${queryRequest}`)
            if (response.status === 200) {
                const { numHits } = response.data
                const { fixturesArray } = response.data
                this.setState({
                    numHits,
                    fixturesArray,
                    success: true
                })
            } else {
                this.setState({ resultsMessage: "Error, database/server problems" })
            }
            return response
        } catch (error) {
            return error.response
        }
    }


    fixturesMap() {
        const fixturesArray = this.state.fixturesArray

        return fixturesArray.map(function (element) {
            const fixtureTitle = `${element.make} ${element.model}`
            const fixtureLink = `/fixtures/${element.url_id}/${element.make}-${element.model.replace(/\s/g, "-")}`
            const imagesArray = element.images
            const imageURL = imagesArray[0]
            return (
                <React.Fragment key={element.url_id}>
                    <div className="fixture" data-id={element.url_id}>
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
                </React.Fragment>
            )
        })
    }

    async componentDidMount() {
        this._isMounted = true
        if (this._isMounted) {
            await this.getFixtures()
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    async componentDidUpdate(prevProps) {
        const { pathname, query } = this.props.router
        if (this.props.router.asPath !== prevProps.router.asPath) {
            await this.getFixtures()
            // fetch data based on the new query
        }
    }

    render() {
        return (
            <div id="search-results" className="container">
                <Header
                    title={"Search Results"}
                    noIndex={true}
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
                            success={this.state.success}
                        />
                        <Results
                            fixturesMap={this.fixturesMap()}
                            numHits={this.state.numHits}
                            path={this.state.path}
                            pageNum={this.state.pageNum}
                            success={this.state.success}
                            query={this.state.query}
                        />
                    </div>
                    <SideBar />
                </div>
                <Footer />
            </div>
        )
    }
}

export default withRouter(Search)
