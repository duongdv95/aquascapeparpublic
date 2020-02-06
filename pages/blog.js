import React from "react";
import Nav from "../components/nav.js"
import Footer from "../components/footer.js"
import Header from "../components/header.js";
import SideBar from "../components/sidebar.js"
import Router from 'next/router'

class Blog extends React.Component {
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
            <div id="blog">
                <Nav 
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    query={this.state.query}
                    currentPage="index"
                />
                <Header />
                <div className="main">
                    <div id="helpful-links" className="content-wrap">
                        <h1>Blog</h1>
                        Coming soon
                    </div>
                    <SideBar/>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default Blog