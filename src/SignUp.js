import React, { Component } from "react";
import { Auth } from "aws-amplify";
import './loginfiles/bootstrap.min.css'
import './loginfiles/style.css'
import './loginfiles/responsive.css'
import en from './loginfiles/en.json';
import fr from './loginfiles/fr.json';
import es from './loginfiles/es.json';
import PropTypes, { string } from 'prop-types';
import {
  setTranslations,
  setDefaultLanguage,
  setLanguageCookie,
  setLanguage,
  translate,
} from 'react-switch-lang';
import configurationData from './configurationData';



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



class SignUp extends Component {
  constructor(props) {
    super(props);
    this.SignUpNew = this.SignUpNew.bind(this);
    this.state = { ...INITIAL_STATE };
    
  }

  componentDidMount() {
    const ga = window.gapi && window.gapi.auth2 ? 
        window.gapi.auth2.getAuthInstance() : 
        null;
    if (!ga) this.createScript();
    
    
    if(localStorage.getItem('currentlanguage'))
    {
      this.setState({language:localStorage.getItem('currentlanguage')});
    }
   
}


SignUpNew() {
  this.setState({submitted:false})
  const ga = window.gapi.auth2.getAuthInstance();
  ga.SignUp().then(
      googleUser => {
          this.getAWSCredentials(googleUser);
      },
      error => {
          console.log(error);
      }
  );
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
    const { email, password } = this.state;

let attributes=
 {
    "email":email
};
    Auth.signUp(
        email, 
        password,
        email
        )
      .then(user => {
        this.setState({success:true})
        this.setState({submitted:false}); 
        this.setState({error:null});
        this.setState({email:""})
        this.setState({password:""})
      })
      .catch(err => {
        this.setState({error:err.message})
        this.setState({success:null})
        this.setState({submitted:false}); 
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
          <li><a className={this.state.language==='en'?'active':""} href="#" onClick={this.handleSetLanguage('en')}>English</a></li>
          <li><a className={this.state.language==='es'?'active':""} href="#" onClick={this.handleSetLanguage('es')}>Spanish</a></li>
          <li><a className={this.state.language==='fr'?'active':""} href="#" onClick={this.handleSetLanguage('fr')}>French</a></li>         
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
              
               <h3 className="errorstyle">
                 {
                   (this.state.error)?t("errormessage")+" : "+this.state.error:""
                 }
               </h3>
               <h3 className="successstyle">
                 {
                   (this.state.success)?t("successmessagesignup"):""
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
              <button className="btn btn-default" disabled={this.state.submitted}>{t('signup')}</button>
             <div className="col-sm-12">
               <div className="col-sm-6"><button type="button" className="bottomLinksStyle" onClick={() => this.changeState("signIn")}>{t('LoginLabel')}</button></div>
               <div className="col-sm-6"><button type="button" className="bottomLinksStyle" onClick={() => this.changeState("forgotPassword")}>{t('ForgotPasswordLabel')}</button></div>
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


SignUp.propTypes = {
  t: PropTypes.func.isRequired,
};

export default translate(SignUp);
