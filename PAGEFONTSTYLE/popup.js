const Btn_press = document.getElementById('myButton');
Btn_press.addEventListener('click', function() {
    console.log('Button Pressed');
    const textBox = document.getElementById('text');
    textBox.textContent = 'Press';
} );