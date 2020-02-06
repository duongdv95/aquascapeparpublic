import React from "react";

function Links() {
        return (
            <div id="helpful-links" className="sidebar-item">
                <h1>
                    Helpful links <i className="fas fa-link"></i>
                </h1>
                <ul>
                    <li>
                        <a href="/aquarium-substrate-calculator" >Substrate Calculator</a>
                    </li>
                    <li>
                        <a href="/choosing-a-light" >What lighting is right for me?</a>
                    </li>
                    <li>
                        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfw5aya20GUKojCX_8r93mUfhDZdevyZs6zeGu13eCRNw4iyg/viewform?usp=sf_link" target="_blank" rel="noopener noreferrer">Subscribe to get updates</a>
                    </li>
                    <li>
                        <a href="/testing-method" >How do you test the fixtures?</a>
                    </li>
                </ul>
            </div>
        )
}

function AmazonBanner() {
    return (
        <div id="amazon-banner" className="sidebar-item">
            <h1>Support this site <i className="far fa-thumbs-up"></i></h1>
            <div>
                If this site helped you in your aquascaping journey, consider buying
                aquarium products from the Amazon link below. I will receive a small
                percentage. Thank you!

            </div>
            <a href="http://www.amazon.com/?tag=danield04-20">
                <img src="https://d2s6kvwb83n6p4.cloudfront.net/amazon-main.png" alt="Amazon Main Link"/>
            </a>
        </div>
    )
}

function Blog() {
    return (
        <div id="blog-sidebar" className="sidebar-item">
            <h1>
                Blog
            </h1>
            Coming soon
        </div>
    )
}

function SocialMedia() {
    return (
        <div id="social-media" className="sidebar-item">
            <h1>
            Social Media <i className="far fa-comment"></i>
            </h1>
            <div className="content">
                <div id="instagram-icon">
                    <div className="fab fa-instagram"></div>
                </div>
                <div className="link">
                    <a href="https://instagram.com/discoveraquascape" target="_blank" rel="noopener noreferrer">discoveraquascape</a>
                </div>
            </div>
        </div>
    )
}

function Guide() {
    return (
        <div id="quick-search">
            <h1>Aquarium Lights <i className="far fa-lightbulb"></i></h1>
            <div>
                Find PAR-tested values for popular aquarium light 
                fixtures such BeamsWork, Chihiros, NICREW, Finnex, etc. 
                Aquascape and grow aquatic plants with confidence.
            </div>
        </div>
    )
}

class SideBar extends React.Component {
    render() {
        return (
            <div id="side-bar">
                <Guide/>
                <Links/>
                <AmazonBanner/>
                <SocialMedia/>
                <Blog/>
            </div>
        )
    }
}

export default SideBar