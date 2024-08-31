chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "fillAndSubmit") {
        // Replace with your default values or fetch from storage
        const defaultWifiId = 'b323009';
        const defaultWifiPassword = '6569as@AS';

        const usernameField = document.getElementById('LoginUserPassword_auth_username');
        const passwordField = document.getElementById('LoginUserPassword_auth_password');
        const form = document.getElementById('UserCheck_Login_Button_span');

        if (usernameField && passwordField && form) {
            // You can also use chrome.storage.sync to fetch saved credentials
            chrome.storage.sync.get(['wifiId', 'wifiPassword'], function(items) {
                const wifiId = items.wifiId || defaultWifiId;
                const wifiPassword = items.wifiPassword || defaultWifiPassword;

                usernameField.value = wifiId;
                passwordField.value = wifiPassword;
                form.click();
            });
        } else {
            console.log('Form elements not found.');
        }
    }
});
