import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, hashHistory,browserHistory} from "react-router";

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <h1>Hello</h1>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("app"));