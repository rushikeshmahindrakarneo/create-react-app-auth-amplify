import React, { Component } from "react";
import { Auth } from "aws-amplify";
import './css/bootstrap.min.css'
import './css/style.css'
import './css/responsive.css'
import en from '../configuration/en.json';
import fr from '../configuration/fr.json';
import es from '../configuration/es.json';
import PropTypes, { string } from 'prop-types';
import {
  setTranslations,
  setDefaultLanguage,
  setLanguageCookie,
  setLanguage,
  translate,
} from 'react-switch-lang';
import configurationData from '../configuration/configurationData';

setTranslations({ en, fr,es });
setDefaultLanguage( localStorage.getItem('currentlanguage')?localStorage.getItem('currentlanguage'):'en');

//setLanguageCookie();



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
  success:null,
  googletoken:null,
  accessToken:null,
  idToken:null,
  refreshToken:null
};

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.signInNew = this.signInNew.bind(this);
    this.state = { ...INITIAL_STATE };
  
    
  }

  componentDidMount() {
    this.handleSetLanguage(this.state.language);
    const ga = window.gapi && window.gapi.auth2 ? 
        window.gapi.auth2.getAuthInstance() : 
        null;
    if (!ga) this.createScript();
   
    
    if(localStorage.getItem('currentlanguage'))
    {
      this.setState({language:localStorage.getItem('currentlanguage')});
    }
   
    
}


signInNew() {
  this.setState({submitted:false})
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


async getAWSCredentials(googleUser) {
  this.setState({submitted:true})
  const { id_token, expires_at } = googleUser.getAuthResponse();
  
  const profile = googleUser.getBasicProfile();
  let user = {
      email: profile.getEmail(),
      name: profile.getName()
  };
  
  const credentials = await Auth.federatedSignIn(
      'google',
      { token: id_token, expires_at },
      user
  );
  
  this.setState(
    updateByPropertyName("email", user.email)
  )

  this.setState(
    updateByPropertyName("googletoken",id_token)
  )

  localStorage.clear();
  if(this.state.companyname===null || this.state.companyname==="")
    this.setState({error:"Please enter company name"})
  else   
    this.LoginFromLambda();
  
}

createScript() {
  // load the Google SDK
  const script = document.createElement('script');
  script.src = 'https://apis.google.com/js/platform.js';
  script.async = true;
  script.onload = this.initGapi;
  document.body.appendChild(script);
}

initGapi() {
  // init the Google SDK client
  const g = window.gapi;
  g.load('auth2', function() {
      g.auth2.init({
          client_id: configurationData.googleClientId,
          // authorized scopes
          scope: 'email'
      });
  });
}
   
  
  handleSetLanguage = (key) => () => {
   
    this.setState({language:key})
    setLanguage(key);
    localStorage.setItem('currentlanguage',key);
  };


  changeState(type, event) {
    const { changeAuthState } = this.props;
    changeAuthState(type, event);
  }

  
  onSubmit= event => {
    this.setState({submitted:true});
    const { email, password,companyname } = this.state;

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
          
         localStorage.clear();
localStorage.setItem("currentlanguage",this.state.language);
         this.setState(
          updateByPropertyName("idToken",user.signInUserSession.idToken.jwtToken)
        );
        this.setState(
          updateByPropertyName("accessToken",user.signInUserSession.accessToken.jwtToken)
        );
        this.setState(
          updateByPropertyName("refreshToken",user.signInUserSession.refreshToken.token)
        );      
        this.LoginFromLambda();
        }        
      })
      .catch(err => {
        this.setState({error:err.message})
        this.setState({success:null})
        this.setState({submitted:false}); 
      });

    event.preventDefault();
  };

  LoginFromLambda=()=>{   
    
    const { email, password,companyname } = this.state;
    let	headers= {
      "Content-type": "application/json; charset=UTF-8"
      
    }
    if(this.state.googletoken!==null && this.state.googletoken!=="")
    {
      headers.googletoken=this.state.googletoken;
    }
    if(this.state.idToken!==null && this.state.idToken!=="")
    {
      headers.idToken=this.state.idToken;
      headers.refreshToken=this.state.refreshToken;
      headers.accessToken=this.state.accessToken;
    }
   
    fetch(configurationData.loginUrl, {
			method: 'POST',
			body: JSON.stringify({
        "emailId": email,
        "password": password,
        "companyName": companyname
      }),
		  headers,
		}).then(response => {
				return response.json()
			}).then(json => {        
        if(json.success)
        {
          this.setState({success:"True"})
          this.setState({error:null})
          this.setState({submitted:false});
          window.location.href = configurationData.redirectUrl+'?token='+json.tokenId;
        }
        else
        {
          this.setState({success:null})
          this.setState({error:json.message})
          this.setState({submitted:false});
        }      
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
          <li><a className={this.state.language==='en'?'active':""} href="#" onClick={this.handleSetLanguage('en')}>English</a></li>
          <li><a className={this.state.language==='es'?'active':""} href="#" onClick={this.handleSetLanguage('es')}>Spanish</a></li>
          <li><a className={this.state.language==='fr'?'active':""} href="#" onClick={this.handleSetLanguage('fr')}>French</a></li>
         
        </ul>
        {
          
          (this.state.companyname!=="" && !this.state.submitted)?<button className="googlebutton" onClick={this.signInNew}>Login With Google</button>:""
         
        }
        
      
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
              
               <h3 className="errorstyle">
                 {
                   (this.state.error)?t("errormessage")+" : "+this.state.error:""
                 }
               </h3>
               <h3 className="successstyle">
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
             <div className="col-sm-12">
               <div className="col-sm-6"><button className="bottomLinksStyle" onClick={() => this.changeState("signUp")}>{t('NewUserLabel')}</button></div>
               <div className="col-sm-6"><button className="bottomLinksStyle" onClick={() => this.changeState("forgotPassword")}>{t('ForgotPasswordLabel')}</button></div>
             </div>
             
              
              
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
