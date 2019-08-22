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
setDefaultLanguage('en');
setLanguageCookie();



const updateByPropertyName = (propertyName, value) => () => ({
  [propertyName]: value
});

const INITIAL_STATE = {
  isCodeSent:false,    
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
  refreshToken:null,
  verificationcode:"",
  success2:null,
  confirmpassword:""
};
let errorstyle = {
  textAlign:"center",
  color:"Red"
};
let successstyle = {
  textAlign:"center",
  color:"green"
};



let bottomLinksStyle={
    marginTop: "5px",
    fontSize: "14px",
    padding: "0",
    border: "none"
};


class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.ForgotPasswordNew = this.ForgotPasswordNew.bind(this);
    this.state = { ...INITIAL_STATE };
  }

  


ForgotPasswordNew() {
    
  this.setState({submitted:false})
  const ga = window.gapi.auth2.getAuthInstance();
  ga.ForgotPassword().then(
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
  };


  changeState(type, event) {
    const { changeAuthState } = this.props;
    changeAuthState(type, event);
  }

  
  onSubmit= event => {
    this.setState({submitted:true}); 
    this.setState({error:null});
    this.setState({success:null});
    const { email, password,verificationcode,confirmpassword } = this.state;
    if(this.state.isCodeSent)
    {
      if(password !== confirmpassword) {
        this.setState({error:"Passwords Do Not Match"});
        this.setState({success:null})
          this.setState({submitted:false}); 
          event.preventDefault();
      }
      else{
        Auth.forgotPasswordSubmit(email, verificationcode, password)
        .then(data => {
          this.setState({success2:true}); 
          let vm=this;
          setTimeout(function(){
            vm.changeState("signIn");
          },3000)       
        })
        .catch(err => {
          this.setState({success:null});
          this.setState({submitted:false}); 
          this.setState({success:err});
        });
      }
     
    }
    else
    {
      
        Auth.forgotPassword(
          email
          )
        .then(user => {
          this.setState({success:true})
          this.setState({submitted:false}); 
          this.setState({error:null});
          this.setState({isCodeSent:true});
          
        })
        .catch(err => {
          this.setState({error:err.message})
          this.setState({success:null})
          this.setState({submitted:false}); 
        });
      
      
        
      event.preventDefault();
    
    }

    event.preventDefault();
  };

  
  


  render() {


    const { email, password,confirmpassword, companyname,error,verificationcode } = this.state;

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
              
               <h3 style={errorstyle}>
                 {
                   (this.state.error)?t("errormessage")+" : "+this.state.error:""
                 }
               </h3>
               <h3 style={successstyle}>
                 {
                   (this.state.success)?t("RequestPasswordSuccess").replace("####emailhere####",this.state.email):""
                 }
               </h3>   
               <h3 style={successstyle}>
                 {
                   (this.state.success2)?t("PasswordChangeSuccess"):""
                 }
               </h3>          
             
              
            </li>
	  				<li>
              <input type="text" name="" placeholder={t('user')} value={email}
              onChange={event =>
                this.setState(updateByPropertyName("email", event.target.value))
              } required/>
              </li>

              {
                  (this.state.isCodeSent)?(
                <>
                  <li>
                  <input type="text" name="" placeholder={t('verificationcode')} value={verificationcode}
                  onChange={event =>
                    this.setState(updateByPropertyName("verificationcode", event.target.value))
                  } required/>
                  </li>
                  <li>
                  <input type="text" name="" id="password" placeholder={t('NewPassword')} value={password}
                  onChange={event =>
                    this.setState(updateByPropertyName("password", event.target.value))
                  } required/>
                  </li>
                  <li>
                  <input type="text" id="confirm_password" name="" placeholder={t('ConfirmPassword')} value={confirmpassword}
                  onChange={event =>
                    this.setState(updateByPropertyName("confirmpassword", event.target.value))
                  } required/>
                  </li>
                  </>
                  ):""
              }
	  				
              <li>
              
              <button className="btn btn-default" disabled={this.state.submitted}>{
                
                (this.state.isCodeSent)?t('SubmitNewPassword'):t('RequestPassword')
                
                
                }</button>
             <div className="col-sm-12">
               <div className="col-sm-6"><button type="button" style={bottomLinksStyle} onClick={() => this.changeState("signIn")}>{t('LoginLabel')}</button></div>
               <div className="col-sm-6"><button type="button" style={bottomLinksStyle} onClick={() => this.changeState("signUp")}>{t('NewUserLabel')}</button></div>
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


ForgotPassword.propTypes = {
  t: PropTypes.func.isRequired,
};

export default translate(ForgotPassword);
