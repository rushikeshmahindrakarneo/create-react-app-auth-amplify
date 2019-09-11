import React, { Component } from "react";
import { Auth } from "aws-amplify";
import './css/bootstrap.min.css'
import './css/style.css'
import './css/responsive.css'
import en from '../configuration/en.json';
import fr from '../configuration/fr.json';
import es from '../configuration/es.json';
import PropTypes from 'prop-types';
import {
  setTranslations,
  setDefaultLanguage,
  setLanguage,
  translate,
} from 'react-switch-lang';
import configurationData from '../configuration/configurationData';

setTranslations({ en, fr,es });
setDefaultLanguage( localStorage.getItem('currentlanguage')?localStorage.getItem('currentlanguage'):'en');

const updateByPropertyName = (propertyName, value) => () => ({
  [propertyName]: value
});

const INITIAL_STATE = {
  count:0,
  resendcodeactive:false,
  iscoderesent:false,
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
  rememberMe:false,
  showverificationtextbox:false,
  verificationcode:""
};

class SignIn extends Component {

  constructor(props) {
    super(props);
    this._isMounted=false;
    this.signInNew = this.signInNew.bind(this);
    this.state = { ...INITIAL_STATE };

  }

  componentDidMount() {
    this._isMounted = true;
    this.handleSetLanguage(this.state.language);
    const ga = window.gapi && window.gapi.auth2 ?
        window.gapi.auth2.getAuthInstance() :
        null;
    if (!ga) this.createScript();

    if(localStorage.getItem('currentlanguage'))
    {
      this.setState({language:localStorage.getItem('currentlanguage')});
    }
    if(localStorage.getItem('rememberMe')!==null && localStorage.getItem('rememberMe')==='true')
    {
      this.setState({rememberMe:true});
      this.setState({email:localStorage.getItem('email')});
      this.setState({companyname:localStorage.getItem('companyname')});
      //conso
    }
  }
  componentWillUnmount()
  {
   this._isMounted=false;
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
    const { id_token } = googleUser.getAuthResponse();

    const profile = googleUser.getBasicProfile();
    let user = {
        email: profile.getEmail(),
        name: profile.getName()
    };

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

  handleStartStop() {

    var vm=this;
    function timer() {
      console.log(vm.state.count);
      console.log(vm.state.isunmounted)
      if(vm.state.count!==0 && vm._isMounted)
      {
        vm.setState({
          count: (vm.state.count -= 1) // mutating state directly here
        });
      }
      else
      {
        console.log('done');
        clearInterval(counter);
        if(vm._isMounted!==false)
        vm.setState({resendcodeactive:false});
        
      }
      
    }

   
    let counter = setInterval(timer, 1000);
    this.state.count = 60; // mutating state directly here
  }

  resendVerificationCode()
  {
    this.setState({submitted:true});
    this.setState({iscoderesent:false})
    Auth.resendSignUp(this.state.email).then(() => {
      this.setState({iscoderesent:true})
      this.setState({submitted:false});
      this.setState({error:null});
      this.handleStartStop();
      this.setState({resendcodeactive:true});
             // this.setState({act})
    }).catch(e => {
      this.setState({error:e.message});
      this.setState({submitted:false});
    });
  }
VerifyUser()
{
  this.setState({submitted:true})
    if(this.state.verificationcode!==null && this.state.verificationcode!=="")
    {
      Auth.confirmSignUp(this.state.email, this.state.verificationcode, {
        // Optional. Force user confirmation irrespective of existing alias. By default set to True.
        forceAliasCreation: true
    }).then((data)=>{
      this.setState({userconfirmed:true,iscoderesent:false,error:""});
      

      setTimeout(
        function() {
          // this.changeState("signIn");
          window.location.reload();
        }
        .bind(this),
        3000
    );

    }).catch(err => {
      if(err.code==="CodeMismatchException")
      {
        this.setState({InvalidVerificationCode:true,error:null,submitted:false})
      }
      else
      {
        this.setState({InvalidVerificationCode:false,error:err.message,submitted:false});
      }
      console.log(err)});
    }
    else
    {
      this.setState({error:this.props.t("verificationcodevalidation")})
      this.setState({submitted:false})
    }
}
  onSubmit= event => {

    event.preventDefault();
    //console.log(this.state.rememberMe);
    if(this.state.showverificationtextbox)
    {
      this.VerifyUser();
    }
    else
    {
      if(this.state.rememberMe===true)
      {
        localStorage.setItem('email',this.state.email);
        localStorage.setItem('companyname',this.state.companyname);
        localStorage.setItem('rememberMe',this.state.rememberMe);
      }
      else
      {
        localStorage.removeItem('email');
        localStorage.removeItem('companyname');
        localStorage.removeItem('rememberMe');
  
      }
      this.setState({submitted:true});
      const { email, password } = this.state;
  
      Auth.signIn(email, password)
        .then(user => {
  
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
  if(this.state.rememberMe)
  {
    localStorage.setItem('email',this.state.email);
    localStorage.setItem('companyname',this.state.companyname);
    localStorage.setItem('rememberMe',this.state.rememberMe);
  }
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
          console.log(err);
  
          if(err.code==="UserNotFoundException")
          {
            this.setState({error:this.props.t('InvalidCredentials')})
          }
          else if(err.code==="UserNotConfirmedException")
          {
            this.setState({error:this.props.t('UserNotVerified'),showverificationtextbox:true})
  
          }
          else
          {
            this.setState({error:err.message})
          }
  
          this.setState({success:null})
          this.setState({submitted:false});
        });
  
    }
    
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
          window.location.href = configurationData.redirectUrl2+'?token='+json.tokenId;
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

    const { email, password, companyname } = this.state;
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
              <li><a className={this.state.language==='en'?'active':""} href="#top" onClick={this.handleSetLanguage('en')}>English</a></li>
              <li><a className={this.state.language==='es'?'active':""} href="#top" onClick={this.handleSetLanguage('es')}>Español</a></li>
              <li><a className={this.state.language==='fr'?'active':""} href="#top" onClick={this.handleSetLanguage('fr')}>Français</a></li>

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
              <img src="https://staticcontent.inelcan.com/img/4gflota_logo.png" alt="4GFlota" className="img-responsive" />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <form onSubmit={this.onSubmit}>
              <ul className="form-container">
                <li>
                <h3 className="successstyle">
                        {
                          (this.state.userconfirmed)?t("UserConfirmSuccess") :""
                        }
                      </h3>
                <h3 className="successstyle">
                      {
                        (this.state.iscoderesent)?t("verificationcoderesentsuccess"):""
                      }
                    </h3>
                  <h3 className="errorstyle">
                    {
                      (this.state.error)?t("errormessage")+" : "+this.state.error:""
                    }
                  </h3>
                  <h3 className="errorstyle">
                    {
                      (this.state.InvalidVerificationCode)?t("InvalidVerificationCode"):""
                    }
                  </h3>
                  <h3 className="successstyle">
                    {
                      (this.state.success)?t("successmessage"):""
                    }
                  </h3>
                  <h3 className="successstyle">
                    {
                      (this.state.UserConfirmSuccess)?t("UserConfirmSuccess"):""
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
                  (!this.state.showverificationtextbox)?(<>
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
                </>):""
                }
                {
                  (this.state.showverificationtextbox)?( <li>
                    <input type="text" name="" placeholder={t('VerificationCode')}
                    onChange={event =>
                      this.setState(
                        updateByPropertyName("verificationcode", event.target.value)
                      )
                    } required/>
                    </li>):""
                }



{
  (!this.state.showverificationtextbox)?(<li>
    <input type="checkbox" name=""

    onChange={event =>
      this.setState(
        updateByPropertyName("rememberMe", event.target.checked)
      )
    } defaultChecked={Boolean(localStorage.getItem('rememberMe'))===false?false:true}/>
     <label>Remember Me</label>
    </li>):""
}

                <li>
                  {
                    (!this.state.showverificationtextbox)?(<button className="btn btn-default" disabled={this.state.submitted}>{t('login')}</button>):""
                  }
                  {
                    (this.state.showverificationtextbox)?(
                    <>
                    <button className="btn btn-default" disabled={this.state.submitted}>{t('VerifyButton')}</button>
                    <br/><br/>
                    <button type="button" onClick={()=>this.resendVerificationCode()} className="btn btn-default" disabled={this.state.submitted || this.state.resendcodeactive}>{t("ResendVerificationCodeButton")}</button>
                    </>):""
                  }

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
      <p><a href="https://www.4gflota.com" rel="noopener">www.4gflota.com</a></p>
    </footer>
    </>
    );
  }
}

SignIn.propTypes = {
  t: PropTypes.func.isRequired,
};

export default translate(SignIn);
