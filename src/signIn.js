import React, { Component } from "react";
import { Auth } from "aws-amplify";


import './loginfiles/bootstrap.min.css'
import './loginfiles/style.css'
import './loginfiles/responsive.css'




// const styles = {
//   continer: {
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "center",
//     alignItems: "center"
//   },
//   input: {
//     width: "100%",
//     padding: "12px 20px",
//     margin: "8px 0",
//     display: "inline-block",
//     border: "1px solid #ccc",
//     borderRadius: "4px",
//     boxSizing: "border-box"
//   },
//   submit: {
//     width: "100%",
//     backgroundColor: "#4CAF50",
//     color: "white",
//     padding: "14px 20px",
//     margin: "8px 0",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer"
//   }
// };

const updateByPropertyName = (propertyName, value) => () => ({
  [propertyName]: value
});

const INITIAL_STATE = {
  email: "",
  password: "",
  error: null
};

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  changeState(type, event) {
    const { changeAuthState } = this.props;
    changeAuthState(type, event);
  }

  onSubmit = event => {
    const { email, password } = this.state;

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
    const { email, password, error } = this.state;

    const isInvalid = password === "" || email === "";

    return (
      <>
      <div className="wrapper">
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
          <li><a href="#">English</a></li>
          <li><a href="#">Spanish</a></li>
          <li><a href="#">French</a></li>
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
  			<form>
  				<ul className="form-container">
	  				<li>
              <input type="text" name="" placeholder="User"/>
              </li>
	  				<li>
              <input type="password" name="" placeholder="Password"/>
              </li>
	  				<li>
              <button className="btn btn-default">Log In</button>
              </li>
	  			</ul>
  			</form>
  		</div>
  	</div>
  </div>

  <footer>
  	<p><a href="http://www.4gflota.com" target="_blank">www.4gflota.com</a></p>
  </footer>

</div>
</>
    );
  }
}

export default SignIn;
