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

setTranslations({ en, fr,es });
setDefaultLanguage( localStorage.getItem('currentlanguage')?localStorage.getItem('currentlanguage'):'en');

const updateByPropertyName = (propertyName, value) => () => ({
  [propertyName]: value
});

const INITIAL_STATE = {
  InvalidVerificationCode:false,
  email: "",
  password: "",
  confirmpassword:"",
  companyname:"",
  language:'en',
  error: null,
  submitted:false,
  success:null,
  userconfirmed:false,
  googletoken:null,
  accessToken:null,
  idToken:null,
  refreshToken:null,
  iscodesent:false,
  iscodeserent:false,
  verificationcode:null,
  resendcodeactive:false,
  count:60,
  isunmounted:false
};

class SignUp extends Component {
  constructor(props) {
    super(props);
    this._isMounted=false;

    this.SignUpNew = this.SignUpNew.bind(this);
    this.state = { ...INITIAL_STATE };
    
  }

  componentDidMount() {
    this._isMounted = true;
    const ga = window.gapi && window.gapi.auth2 ? 
        window.gapi.auth2.getAuthInstance() : 
        null;
    if (!ga) this.createScript();
    
    if(localStorage.getItem('currentlanguage'))
    {
      this.setState({language:localStorage.getItem('currentlanguage')});
    }
    //this.enterVerificationCode();
  //  this.handleStartStop();
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
  onSubmit= event => {
    if((this.state.password!=="" && this.state.confirmpassword!=="" && this.state.password!==this.state.confirmpassword))
    {

    }
    else
    {
      this.setState({submitted:true});
      const { email, password } = this.state;
  
          Auth.signUp(
              email, 
              password,
              email
              )
            .then(user => {
              this.setState({success:true})
              this.setState({submitted:false}); 
              this.setState({error:null});
              //this.setState({email:""})
              this.setState({password:""})
              this.setState({confirmpassword:""})
              this.setState({iscodesent:true});
              this.handleStartStop();
              this.setState({resendcodeactive:true});
            })
            .catch(err => {
              if(err.code==="UsernameExistsException")
              {
                this.setState({error:this.props.t('UserAlreadyExists')})
              }
              else
              {
                this.setState({error:err.message})
              }              
              this.setState({success:null})
              this.setState({submitted:false}); 
            });
    }
    

        event.preventDefault();
  };

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
  componentWillUnmount()
  {
   this._isMounted=false;
  }
  verifyCode()
  {
    this.setState({submitted:true})
    if(this.state.verificationcode!==null && this.state.verificationcode!=="")
    {
      Auth.confirmSignUp(this.state.email, this.state.verificationcode, {
        // Optional. Force user confirmation irrespective of existing alias. By default set to True.
        forceAliasCreation: true    
    }).then((data)=>{
      this.setState({userconfirmed:true})
      this.setState({success:false})

      setTimeout(
        function() {
          this.changeState("signIn");
        }
        .bind(this),
        3000
    );
      
    }).catch(err => {
      if(err.code==="CodeMismatchException")
      {
        this.setState({InvalidVerificationCode:true,error:null,submitted:false,success:false})
      }
      else
      {
        this.setState({InvalidVerificationCode:false,error:err.message,submitted:false,success:false});
      }
      console.log(err)});
    }
    else
    {
      this.setState({error:this.props.t("verificationcodevalidation")})
      this.setState({submitted:false})
    }
  }

  render() {

    const { email, password,confirmpassword } = this.state;
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
                  <h3 className="errorstyle">
                    {
                      (this.state.InvalidVerificationCode)?t("InvalidVerificationCode"):""
                    }
                  </h3>
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
                    <h3 className="successstyle">
                      {
                        (this.state.iscoderesent)?t("verificationcoderesentsuccess"):""
                      }
                    </h3>       
                    <h3 className="errorstyle">
                      {
                        (this.state.password!=="" && this.state.confirmpassword!=="" && this.state.password!==this.state.confirmpassword)?t("PasswordDoNotMatch"):""
                      }
                      </h3>   
                      <h3 className="successstyle">
                        {
                          (this.state.userconfirmed)?t("UserConfirmSuccess") :""
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
                      (!this.state.iscodesent)?(<><li>
                    <input type="password" name="" placeholder={t('password')}  value={password}
                    onChange={event =>
                      this.setState(
                        updateByPropertyName("password", event.target.value)
                      )
                    } required/>
                    </li>
                    <li>
                    <input type="password" name="" placeholder={t('ConfirmPassword')}  value={confirmpassword}
                    onChange={event =>
                      this.setState(
                        updateByPropertyName("confirmpassword", event.target.value)
                      )
                    } required/>
                    </li></>):""
                    }
                 
                    <li>
                      {
                        (this.state.iscodesent)?(<input type="text" name="" placeholder={t("VerificationCode")} 
                        onChange={event =>
                          this.setState(
                            updateByPropertyName("verificationcode", event.target.value)
                          )
                        } required/>):""
                      }                    
                    </li>
                    <li>

                      {
                        (!this.state.iscodesent)?(<button className="btn btn-default" disabled={this.state.submitted}>{t('signup')}</button>):("")

                      }
                      {
                        (this.state.iscodesent)?(<>
                        <button type="button" onClick={()=>this.verifyCode()} className="btn btn-default" disabled={this.state.submitted}>{t("VerifyButton")}</button>
                        <br/><br/>
                        <button type="button" onClick={()=>this.resendVerificationCode()} className="btn btn-default" disabled={this.state.submitted || this.state.resendcodeactive}>{t("ResendVerificationCodeButton")}</button>
                        </>):("")

                      }
                      
                      
                    

                    
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
          <p><a href="http://www.4gflota.com" rel="noopener">www.4gflota.com</a></p>
        </footer>
      </>

    );
  }
}

SignUp.propTypes = {
  t: PropTypes.func.isRequired,
};

export default translate(SignUp);
