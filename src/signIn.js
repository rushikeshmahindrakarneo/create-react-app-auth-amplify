import React, { Component } from "react";
import { Auth } from "aws-amplify";


import './loginfiles/bootstrap.min.css'
import './loginfiles/style.css'
import './loginfiles/responsive.css'
import en from './loginfiles/en.json';
import fr from './loginfiles/fr.json';
import es from './loginfiles/es.json';
import PropTypes from 'prop-types';
 
// Translation Higher Order Component
import {
  setTranslations,
  setDefaultLanguage,
  setLanguageCookie,
  setLanguage,
  translate,
} from 'react-switch-lang';
import { GoogleLogin } from 'react-google-login';
 

 



setTranslations({ en, fr,es });
setDefaultLanguage('en');
setLanguageCookie();


const updateByPropertyName = (propertyName, value) => () => ({
  [propertyName]: value
});

const INITIAL_STATE = {
  email: "",
  password: "",
  companyname:"",
  language:'en',
  error: null,
  submitted:false,
  success:null
};
let errorstyle = {
  textAlign:"center",
  color:"Red"
};
let successstyle = {
  textAlign:"center",
  color:"green"
};

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

   
  responseGoogle = (response) => {
    console.log(response.profileObj.email);
  }
  handleSetLanguage = (key) => () => {
    this.setState({language:key})
    setLanguage(key);
  };
  changeState(type, event) {
    const { changeAuthState } = this.props;
    changeAuthState(type, event);
  }

  onSubmit2=event=>{
    const ga = window.gapi.auth2.getAuthInstance();
    ga.signIn().then(
        googleUser => {
            this.getAWSCredentials(googleUser);
        },
        error => {
            console.log(error);
        }
    );
  }
  onSubmit= event => {
    this.setState({submitted:true});
    const { email, password,companyname } = this.state;
console.log(companyname);
    Auth.signIn(email, password)
      .then(user => {
       
        //this.setState(() => ({ ...INITIAL_STATE }));
        if (
          user.challengeName === "SMS_MFA" ||
          user.challengeName === "SOFTWARE_TOKEN_MFA"
        ) {
          this.changeState("confirmSignIn", user);
        } else if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
          this.changeState("requireNewPassword", user);
        } else if (user.challengeName === "MFA_SETUP") {
          this.changeState("TOTPSetup", user);
        } else {
         //console.log(user);
         localStorage.clear();
         this.LoginFromLambda();

        }
        
      })
      .catch(err => {
        // const { authError } = this.props;
        // if (err.code === "UserNotConfirmedException") {
        //   this.changeState("confirmSignUp");
        // } else if (err.code === "PasswordResetRequiredException") {
        //   this.changeState("requireNewPassword");
        // } else {
        //   authError(err);
        // }

        console.log(err);
        this.setState({error:err.message})
        this.setState({success:null})
        this.setState({submitted:false}); 
        //this.setState(updateByPropertyName("error", err));
      });

    event.preventDefault();
  };

  LoginFromLambda=()=>{
    const { email, password,companyname } = this.state;
    fetch('https://8qazrlix7j.execute-api.us-west-2.amazonaws.com/Stage/user/login', {
			method: 'POST',
			body: JSON.stringify({
        "emailId": email,
        "password": password,
        "companyName": companyname
      }),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		}).then(response => {
				return response.json()
			}).then(json => {
      console.log(json);
      if(json.success)
      {
        this.setState({success:"True"})
        this.setState({error:null})
        this.setState({submitted:false});
        localStorage.setItem("accessToken",json.accessToken);
        localStorage.setItem("idToken",json.idToken);
        localStorage.setItem("refreshToken",json.refreshToken);
        window.location.href = 'http://www.google.com'; 
      }
      else
      {
        this.setState({success:null})
        this.setState({error:json.message})
        this.setState({submitted:false});
      }
      //console.log(user);
      
			});
  }

  render() {


    const { email, password, companyname,error } = this.state;

    const isInvalid = password === "" || email === "";
    const { t } = this.props;
    return (
     
  <>    
	<nav className="navbar navbar-default">
    <div className="container-fluid">
      <div className="navbar-header">
        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>        
      </div>
      <div id="navbar" className="navbar-collapse collapse"> 
      	<span className="nav-title">Language</span>       
        <ul className="nav navbar-nav navbar-right">
          <li><a className={this.state.language=='en'?'active':""} href="#" onClick={this.handleSetLanguage('en')}>English</a></li>
          <li><a className={this.state.language=='es'?'active':""} href="#" onClick={this.handleSetLanguage('es')}>Spanish</a></li>
          <li><a className={this.state.language=='fr'?'active':""} href="#" onClick={this.handleSetLanguage('fr')}>French</a></li>
        </ul>
      </div>
    
  <GoogleLogin
    clientId="631943279785-4n6pj6tkh49a823m2supeqothea8ibjh.apps.googleusercontent.com"
    buttonText="Login"
    onSuccess={responseGoogle}
    onFailure={responseGoogle}
    cookiePolicy={'single_host_origin'}
  />
    </div>
  </nav>

  <div className="container main-form-container">
  	<div className="row">
  		<div className="col-md-12">
  			<div className="logo-container">
          <a href="#">
            <img src="https://staticcontent.inelcan.com/img/4gflota_logo.png" alt="4GFlota" className="img-responsive" />
            </a>
            </div>
  		</div>
  	</div>
  	<div className="row">
  		<div className="col-md-12">
  			<form onSubmit={this.onSubmit}>
  				<ul className="form-container">
            <li>
              
               <h3 style={errorstyle}>
                 {
                   (this.state.error)?t("errormessage")+" : "+this.state.error:""
                 }
               </h3>
               <h3 style={successstyle}>
                 {
                   (this.state.success)?t("successmessage"):""
                 }
               </h3>          
             
              
            </li>
	  				<li>
              <input type="text" name="" placeholder={t('user')} value={email}
              onChange={event =>
                this.setState(updateByPropertyName("email", event.target.value))
              } required/>
              </li>
	  				<li>
              <input type="password" name="" placeholder={t('password')}  value={password}
              onChange={event =>
                this.setState(
                  updateByPropertyName("password", event.target.value)
                )
              } required/>
              </li>
              <li>
              <input type="text" name="" placeholder={t('companyname')}  value={companyname}
              onChange={event =>
                this.setState(
                  updateByPropertyName("companyname", event.target.value)
                )
              } required/>
              </li>
	  				<li>
              <button className="btn btn-default" disabled={this.state.submitted}>{t('login')}</button>
              <button type ="button" className="btn btn-default" onClick={this.onSubmit2}>{t('login')}</button>
              </li>
	  			</ul>
  			</form>
  		</div>
  	</div>
  </div>
  <footer>
  	<p><a href="http://www.4gflota.com" target="_blank">www.4gflota.com</a></p>
  </footer>

</>

    );
  }
}


SignIn.propTypes = {
  t: PropTypes.func.isRequired,
};

export default translate(SignIn);
