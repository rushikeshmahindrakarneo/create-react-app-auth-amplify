import React, { Component } from 'react';
import './App.css';
import amplifyCustomUi from "aws-amplify-react-custom-ui";
import SignIn from './signIn';
import SecureApp from './secureApp';


class App extends Component {

  componentWillMount() {
    amplifyCustomUi.setSignIn(SignIn);
  }

  render() {
    return (
      <div className="wrapper">
       <SecureApp />
   </div>
    );
  }
}

export default  App;

