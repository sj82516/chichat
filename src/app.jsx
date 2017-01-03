//@flow

import React from "react";
import ReactDOM from "react-dom";
import {browserHistory, Route, Router, IndexRoute} from 'react-router';
import {Provider} from "react-redux";

import {Container} from './container/container';
import {Index} from './index/index';
import {FirstLogin, Step1, Step2, Step3, Step4} from './firstLogin/firstLogin'

require('./app.scss');
import store from "./redux/store"

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // flow type error!
        // let a:string = 5;
        return (
            <Provider store={store} className="app">
                <Router history={browserHistory}>
                    <Route path="/" component={Container}>
                        <IndexRoute component={Index}/>
                        <Route path="/first-login" component={FirstLogin}>
                            <IndexRoute component={Step1}/>
                            <Route path="/first-login/step2" component={Step2}/>
                            <Route path="/first-login/step3" component={Step3}/>
                            <Route path="/first-login/step4" component={Step4}/>
                        </Route>
                        <Route path="/main">
                            <IndexRoute/>
                            <Route path="/main/friend-list"/>
                            <Route path="/main/chat-ist"/>
                            <Route path="/main/setting"/>
                        </Route>
                    </Route>
                </Router>
            </Provider>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("app"));