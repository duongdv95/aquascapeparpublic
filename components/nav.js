import React from "react";
import SearchBar from "./searchbar.js"

function Nav(props) {
    return (
        <div id="nav">
            <div className="nav-bar">
                <div className="nav-item">
                    <a href="/">
                        <i className="fas fa-leaf"></i>
                        <span>
                            Aquarium PAR Data
                        </span>
                    </a>
                </div>
                <SearchBar/>
            </div>
        </div>
    )
}

export default Nav