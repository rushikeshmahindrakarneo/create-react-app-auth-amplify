import React, { Component } from 'react';
import './App.css';
import amplifyCustomUi from "aws-amplify-react-custom-ui";

class SecureApp extends Component {


  render() {
    return (
      <div className="App">
        <header className="App-header">
          
        </header>
      </div>
    );
  }
}

export default amplifyCustomUi.withAuthenticator(SecureApp);

