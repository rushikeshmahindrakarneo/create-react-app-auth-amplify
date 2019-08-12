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
  error: null
};

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }
  handleSetLanguage = (key) => () => {
    this.setState({language:key})
    setLanguage(key);
  };
  changeState(type, event) {
    const { changeAuthState } = this.props;
    changeAuthState(type, event);
  }

  onSubmit = event => {
    const { email, password,companyname } = this.state;
console.log(companyname);
    Auth.signIn(email, password)
      .then(user => {
        console.log(user);
        
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
         console.log(user);
         localStorage.clear();

        }
      })
      .catch(err => {
        const { authError } = this.props;
        if (err.code === "UserNotConfirmedException") {
          this.changeState("confirmSignUp");
        } else if (err.code === "PasswordResetRequiredException") {
          this.changeState("requireNewPassword");
        } else {
          authError(err);
        }
        this.setState(updateByPropertyName("error", err));
      });

    event.preventDefault();
  };

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
              <button className="btn btn-default">{t('login')}</button>
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
