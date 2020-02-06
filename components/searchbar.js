import React from "react";

class SearchBar extends React.Component {
    render() {
        function handleChange(event) {
            const query = event.target.value
            window.location.href = `${query}`
        }
        return (
            <div style={{margin:"0 0.5em", display:"flex", justifyContent:"center", alignItems:"center"}}>
                <select onChange={handleChange} className="select-css">
                    <option>
                        Search Database
                    </option>
                    <option value="/search?query=BeamsWork">
                        BeamsWork
                    </option>
                    <option value="/search?query=Chihiros">
                        Chihiros
                    </option>
                    <option value="/search?query=NICREW">
                        NICREW
                    </option>
                    <option value="/search?query=ONF">
                        ONF
                    </option>
                    <option value="/search?query=Finnex">
                        Finnex
                    </option>
                    <option value="/search?query=Aqueon">
                        Aqueon
                    </option>
                </select>

            </div>
        )
    }
}

export default SearchBar