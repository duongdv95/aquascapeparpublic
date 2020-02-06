import React from "react";
import Nav from "../components/nav";
import Footer from "../components/footer";
import axios from "axios"
import Header from "../components/header";
import Router from "next/router"

function Options(props) {
    const message = props.message
    const displayMessage = <span>{message}</span>
    const displayOptions = (!props.isLoggedIn) ? (null) :
    (
        <div id="admin-options">
            <div>
                <button>
                    <a id="create-fixture" href="/admin/createFixture">Create Fixture</a>
                </button>
            </div>
            <div>
                <form name="edit-form" onSubmit={props.handleSubmit}>
                    <input name="edit-input" type="text" placeholder="Enter Fixture ID" onChange={props.handleChange}></input>
                    <button>
                        Edit Fixture
                    </button>
                </form>
            </div>
            <div>
                <form name="delete-form" onSubmit={props.handleSubmit}>
                    <input name="delete-input" type="text" placeholder="Enter Fixture ID" onChange={props.handleChange}></input>
                    <button>
                        Delete Fixture
                    </button>
                </form>
            </div>
            <div>
                {displayMessage}
            </div>
        </div>
    )
    return (
        displayOptions
    )
}

function Login(props) {
    let {isLoggedIn, loginMessage} = props
    let displayMessage = (loginMessage) ? (<div>{loginMessage}</div>) : (null)
    let loginForm = (!isLoggedIn) ? (
        <form name="login" onSubmit={props.handleSubmit}>
            <div>
                <label>Username</label>
                <input name="username" type="text" onChange={props.handleChange}/>
            </div>
            <div>
                <label>Password</label>
                <input name="password" type="password" onChange={props.handleChange}/>
            </div>
            <input type="submit" />
        </form>
    ) :
    (null)
    return (
        <div>
            {displayMessage}
            {loginForm}
        </div>
    )
}

function Logout(props) {
    let { isLoggedIn } = props
    let logoutForm = (isLoggedIn) ? (
        <form name="logout" onSubmit={props.handleSubmit}>
            <input type="submit" value="Logout"/>
        </form>
    ) :
    (null)
    return (
        <div>
            {logoutForm}
        </div>
    )
}

class Admin extends React.Component {
    constructor(props) {
        super(props)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this._isMounted = false
        this.state = {
            url_id: "",
            delete_url_id: "",
            message: "",
            isLoggedIn: false,
            username: "",
            password: "",
            loginMessage: "",
            token: "",
            AuthStr: ""
        }
    }

    async checkToken(token) {
        if(token) {
            const AuthStr = `Bearer ${token}`
            let response = await axios.get('/api/checktoken', { headers: {Authorization: AuthStr}})
            if(response.data.success) {
                this.setState({ isLoggedIn: true})
            } 
        }
    }

    async deleteFixture() {
        const formData = new FormData();
        let { delete_url_id }= this.state
        formData.append("url_id", delete_url_id)
        let response = await axios.put("/api/deletefixture", {url_id: delete_url_id}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
        })
        if(response.data.succesS) {

        }
    }
    async login() {
        let { username, password } = this.state
        try {
            let response = await axios.post('/api/login', {username, password})
            let token = response.data.token
            localStorage.setItem("token", token)
            this.setState({ AuthStr: `Bearer ${token}`})
            await this.checkToken(token)
        } catch (err) {
            let loginMessage = err.response.data.message
            this.setState({ loginMessage })
        }
    }

    logout() {
        localStorage.setItem("token", "")
        this.setState({ AuthStr: `Bearer ${localStorage.getItem("token")}`, isLoggedIn: false})
    }

    async handleSubmit(event) {
        event.preventDefault()
        const eventType = event.target.name
        const { url_id, delete_url_id } = this.state
        switch(eventType) {
            case "login":
                await this.login()
                break
            case "logout":
                this.logout()
                break
            case "edit-form":
                if(url_id.length > 0) {
                    Router.push(`/admin/editFixture/${url_id}`)
                } else {
                    this.setState({message: "Invalid ID"})
                }
                break
            case "delete-form":
                if(delete_url_id.length > 0) {
                    this.deleteFixture()
                } else {
                    this.setState({message: "Invalid ID"})
                }
                break
            default: console.log("error")
        }
    }

    handleChange(event) {
        const eventType = event.target.name
        switch (eventType) {
            case "edit-input":
                this.setState({ url_id: event.target.value })
                break
            case "delete-input":
                this.setState({ delete_url_id: event.target.value })
                break
            case "username":
                this.setState({ username: event.target.value})
                break
            case "password":
                this.setState({ password: event.target.value})
                break
            default:
                console.log("error")
        }
    }

    async componentDidMount() {
        this._isMounted = true
        if(this._isMounted) {
            let token = localStorage.getItem("token") || ""
            this.setState({token, AuthStr: `Bearer ${token}`})
            await this.checkToken(token)
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    render() {
        return (
            <div id="admin" className="container">
                <Header/>
                <Nav
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    currentPage="index"
                />
                <div className="main">
                    <div className="content-wrap">
                        <h1>
                            Admin Dashboard
                        </h1>
                        <Login 
                        isLoggedIn = {this.state.isLoggedIn}
                        handleChange = {this.handleChange}
                        handleSubmit = {this.handleSubmit}  
                        loginMessage = {this.state.loginMessage}
                        />
                        <Logout
                        isLoggedIn = {this.state.isLoggedIn}
                        handleSubmit = {this.handleSubmit}  
                        />
                        <Options
                        handleChange = {this.handleChange}
                        handleSubmit = {this.handleSubmit}
                        postgresAvailable = {this.state.postgresAvailable}
                        message = {this.state.message}
                        databaseStatus = {this.state.databaseStatus}
                        isLoggedIn = {this.state.isLoggedIn}
                        />
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default Admin
