
function myFunction() {
  const username = document.getElementById("LoginUserPassword_auth_username");
  const passward = document.getElementById("LoginUserPassword_auth_password");
  const button_check = document.getElementById("UserCheck_Login_Button");


  if (username) {
    username.value = "B323008";
    console.log("Got username");
  }
  if (passward) {
    passward.value = "3a.Anirudha sahu";
    console.log("Got password");
  }
  if (button_check) {
      button_check.click();
    console.log("Got button");
    oAuthentication.submitActiveForm();
  }
}
const enable_btn=document.getElementById("enabling_btn");
if(enable_btn){
  enable_btn.addEventListener("click",myFunction);
}