//@flow

import React from "react";
import ReactDOM from "react-dom";
import {browserHistory, Route, Router, IndexRoute, IndexRedirect} from 'react-router';
import {Provider} from "react-redux";

import {Container} from './container/container';
import {Index} from './index/index';
import {FirstLogin, Step1, Step2, Step3, Step4} from './firstLogin/firstLogin'
import {Main} from  "./main/main";
import {Friend} from "./main/friend/friend"
import {Chat} from "./main/chat/chat"


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
                        <Route path="/main" component={Main}>
                            <IndexRedirect to="/main/friend" />
                            <Route path="/main/friend" component={Friend}/>
                            <Route path="/main/chat" component={Chat}/>
                            <Route path="/main/setting"/>
                        </Route>
                    </Route>
                </Router>
            </Provider>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("app"));