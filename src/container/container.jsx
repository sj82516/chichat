import React from "react";

export class Container extends React.Component {
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div style={{minWidth: '320px', maxWidth: '480px', minHeight: '100vh', margin: 'auto' }}>{this.props.children}</div>
        )
    }
}
