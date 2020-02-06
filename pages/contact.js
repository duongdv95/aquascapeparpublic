import React from "react";
import Nav from "../components/nav.js"
import Footer from "../components/footer.js"
import Header from "../components/header.js";
import Router from 'next/router'

class Contact extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        
        this.state = {
            copyButtonText: "Copy",
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

    copyToClipboard = (e) => {
        this.textArea.select()
        document.execCommand("copy")
        this.setState({copyButtonText: "Copied!"})
    }

    render() {
        return (
            <div id="contact" className="container">
                <Nav 
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    query={this.state.query}
                    currentPage="index"
                />
                <Header 
                    title={"Contact Page"}
                />
                <div className="main">
                    <div className="content-wrap">
                        <h1>Contact</h1>
                        <div>
                            <p>
                                Business inquiries/bug reports/site suggestions can be send to the email below.
                            </p>
                            <div id="email-contact">
                                <i className="fas fa-envelope"></i>
                                <input
                                    type="text"
                                    id="email"
                                    value="dvduong13@gmail.com"
                                    readOnly="readonly"
                                    ref={(textarea) => this.textArea = textarea}
                                ></input>
                                <button onClick={this.copyToClipboard} className="btn-light">
                                    <i className="far fa-copy"></i>
                                    <span>{this.state.copyButtonText}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default Contact