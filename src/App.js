
import React, { Component } from 'react';
import './App.css';

import amplifyCustomUi from "aws-amplify-react-custom-ui";
import SignIn from './loginfiles/signIn';
import SecureApp from './secureApp';
import {BrowserRouter as Router} from 'react-router-dom'
//require("react-router-dom").Route;
//import Route from 'react-router-dom/Route'

import SignUp from './loginfiles/SignUp';
import ForgotPassword from './loginfiles/ForgotPassword';

const Route = require("react-router-dom").Route;
class App extends Component {

  componentWillMount() {
    amplifyCustomUi.setSignIn(SignIn);
    amplifyCustomUi.setSignUp(SignUp);
    amplifyCustomUi.setForgotPassword(ForgotPassword);
    
  }

  render() {
    return (
      <Router>
        <div className="wrapper">
          <Route path="/" exact component={SecureApp}/>
        </div>
      </Router>
    );
  }
}

export default App; 

