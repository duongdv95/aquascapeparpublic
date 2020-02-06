import React from "react";
import axios from "axios"
import Nav from "../components/nav.js"
import Footer from "../components/footer.js"
import Header from "../components/header.js"

class ImageUploadForm extends React.Component {
    render() {
        const uploading = this.props.uploading
        const submitButtonText = (uploading) ? (<span>Uploading...</span>) : (<span>Submit</span>)
        return (
            <div>
                <h1>Step 2: Image Upload</h1>
                <div>
                    <strong>
                        Warning! Uploading images will replace any current images.
                    </strong>
                </div>
                <form name="image-form" onSubmit={this.props.handleSubmit}>
                    <div>
                        <label>Primary Image</label>
                        <input name="select-primary-image" type="file" accept="image/*" onChange={this.props.handleChange}/>
                    </div>
                    <div>
                        <label>Additional Images</label>
                        <input multiple name="select-image" type="file" accept="image/*" onChange={this.props.handleChange}/>
                    </div>
                    <button type="submit" disabled={this.props.uploading}>{submitButtonText}</button><span>{this.props.uploadMessage}</span>
                </form>
            </div>
        )
    }
}

class ImageUpload extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this._isMounted = false
        this.state = {
            loading: true,
            primaryImage: null,
            additionalImages: null,
            imagesArray: [],
            uploading: false,
            uploadMessage: "",
            url_id: props.url_id,
            isLoggedIn: false,
            make: "",
            model: ""
        }
    }

    handleChange(event) {
        const eventType = event.target.name
        switch (eventType) {
            case "select-primary-image":
                const primaryImage = event.target.files
                this.setState({ primaryImage})
                break
            case "select-image":
                const additionalImages = event.target.files
                this.setState({ additionalImages })
                break
            default:
                console.log("error")
        }
    }

    async getFixture() {
        let fixtureID = this.state.url_id
        try {
            const response = await axios.get(`/api/getFixtures?id=${fixtureID}`)
            console.log(response)
            if (response.status === 200) {
                let fixtureData = response.data.fixturesArray[0]
                let {make, model} = fixtureData
                this.setState({make, model})

             } else {
                 this.setState({resultsMessage: "Error, database/server problems"})
             }
            return response
        } catch (error) {
            return error.response
        }
    }

    async handleSubmit(event) {
        event.preventDefault()
        const eventType = event.target.name
        switch (eventType) {
            case "image-form":
                const formData = new FormData();
                const primaryImage = this.state.primaryImage
                const additionalImages = this.state.additionalImages
                const make = this.state.make
                var model = this.state.model
                model = model.replace(/\s+/g, '-');
                const fixture = `${make}_${model}`
                if (primaryImage) {
                    formData.append("url_id", this.state.url_id)
                    formData.append("fixture", fixture)
                    formData.append("image", primaryImage[0])
                    if (additionalImages) {
                        for(let image = 0; image < additionalImages.length; image++) {
                            formData.append("image", additionalImages[image])
                        }
                    }
                    this.setState({ uploading: true })
                    try {
                        let uploadResponse = await axios.post('/api/image-upload', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'Authorization': `Bearer ${localStorage.getItem("token")}`
                            }
                        })
                        if (uploadResponse.data.success) {
                            this.setState({ uploading: false, uploadMessage: "Upload success! Image(s) saved to S3" })
                        } else {
                            this.setState({ uploading: false, uploadMessage: uploadResponse.data.message})
                        }
                    } catch (err) {
                        this.setState({ uploading: false, uploadMessage: `Unauthorized. ${err.response.data.message}`})
                    }

                } else {
                    this.setState({ uploadMessage: "Primary image required!" })
                }

                break

            default: console.log("error")
        }
    }

    static async getInitialProps({query}) {
        return {url_id: query.id}
    }

    async componentDidMount() {
        this._isMounted = true
        if(this._isMounted) {
            let token = localStorage.getItem("token")
            this.checkToken(token)
            await this.getFixture()
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

    componentWillUnmount() {
        this._isMounted = false
    }

    render() {
        let displayImageUpload = (this.state.isLoggedIn) ? (
            <div className="main">
                <div className="content-wrap">
                    <ImageUploadForm
                        handleSubmit   = {this.handleSubmit}
                        handleChange   = {this.handleChange}
                        uploadMessage  = {this.state.uploadMessage}
                        uploading      = {this.state.uploading}
                    />
                    <button>
                        <a href="/admin">Back to admin</a>
                    </button>
                </div>
            </div>
        ) : (
            <div>
                Not authorized
            </div>
        )
        return (
            <div id="fixture" className="container">
                <Header />
                <Nav 
                isDisabled={true}
                />
                {displayImageUpload}
                <Footer/>
            </div>
        )
    }
}

export default ImageUpload
