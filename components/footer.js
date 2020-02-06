import React from "react";

function Footer() {
    return (
        <div id="footer">
            <div className="nav-bar content-wrap">
                <div className="nav-item">
                    <a className="header" href="/">
                        PAR Finder
                    </a>
                    <ul>
                        <li>
                            <a href="/contact" target="_blank"> 
                                Contact
                            </a>
                        </li>
                        <li>
                            <a href="https://docs.google.com/forms/d/e/1FAIpQLSfw5aya20GUKojCX_8r93mUfhDZdevyZs6zeGu13eCRNw4iyg/viewform?usp=sf_link" target="_blank" rel="noopener noreferrer">
                                Subscribe
                            </a>
                        </li>
                        <li>
                            <a href="https://forms.gle/p3vNWnzRhMvtbyp28" target="_blank" rel="noopener noreferrer"> 
                                Contribute
                            </a>
                        </li>
                        <li>
                            <a href="https://instagram.com/discoveraquascape" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-instagram"></i>
                                <span> </span>
                                Instagram
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="nav-item">
                    <a className="header" href="/blog">
                        Blog
                    </a>
                    <ul>
                        <li>
                            <a href="/aquarium-substrate-calculator">
                                Substrate Calculator
                            </a>
                        </li>
                        <li>
                            <a href="/choosing-a-light">
                                Choosing a light
                            </a>
                        </li>
                        <li>
                            <a href="/testing-method">
                                Testing Method
                            </a>
                        </li>
                    </ul>
                </div>
                <div id="amazon-disclaimer">
                    AquariumPARData.com is a participant in the Amazon Services LLC Associates Program.
                </div>
            </div>
        </div>
    )
}

export default Footer