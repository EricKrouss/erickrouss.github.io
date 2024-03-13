document.addEventListener('DOMContentLoaded', function() {
    const text = "Full Stack JavaScript Developer";
    const typedTextElement = document.getElementById('typed-text');
    let index = 0;

    function typeLetter() {
        if (index < text.length) {
            typedTextElement.innerHTML += text.charAt(index);
            index++;
            setTimeout(typeLetter, 100); // Adjust typing speed here
        }
    }

    typeLetter(); // Start the typing effect
});
