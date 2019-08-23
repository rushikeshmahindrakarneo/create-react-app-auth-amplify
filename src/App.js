import React, { Component } from 'react';
import './App.css';
import amplifyCustomUi from "aws-amplify-react-custom-ui";
import SignIn from './signIn';
import SecureApp from './secureApp';
import {BrowserRouter as Router,NavLink,Redirect,Prompt} from 'react-router-dom'
import Route from 'react-router-dom/Route'
import signIn from './signIn';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword'
import { withTranslation, Trans } from 'react-i18next';



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


<Route path="/about" exact render={
  ()=>{
  return <h1>ok</h1>
  }
}/>
   </div>
   </Router>


    );
  }
}

export default withTranslation('common')(App); 

