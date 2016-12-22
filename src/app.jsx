//@flow

import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // flow type error!
        // let a:string = 5;
        return (
            <h1>Hello</h1>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("app"));