
console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\\n\n\n\n\n\n\n\n\n\n\n\n\n\nn\n\n\n\n\n\n\n\n\n\n\n\n\n\nn\n\n\n\nn\\n\n\n\n\n\nb\nb\nn\\\nn\\n\n\n\n\n\n\n\n\n\n\n\n\n\\n\n\n\n\n");
function myFunction() {
  console.log("Anirudha Sahu");
  const username = document.getElementById("LoginUserPassword_auth_username");
  const passward = document.getElementById("LoginUserPassword_auth_password");

  username.value = "B323008";
  console.log("Got username");

  passward.value = "3a.Anirudha sahu";
  console.log("Got password");

  oAuthentication.submitActiveForm()


}

myFunction();

const enable_btn=document.getElementById("enabling_btn");
if(enable_btn){

  console.log("Enable");
  enable_btn.addEventListener("click",myFunction);
}


