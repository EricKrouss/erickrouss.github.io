document.addEventListener("DOMContentLoaded", function(){

    // Get the Search Button and Search Bar elements by their IDs
    var searchButton = document.getElementById('search-button');
    var searchBar = document.getElementById('search-bar');

    // Add a click event listener to the button
    searchButton.addEventListener('click',function() {
        var username = searchBar.value.trim();
        var userURL = `https://api.ashcon.app/mojang/v2/user/${username}`;
        
        //clears previous rsults
        let results = document.getElementById('results');
        document.getElementById('skin').src = '';
        document.getElementById('cape').src = '';



        // Use the Fetch API to retrieve the user profile data.
        fetch(userURL)
            .then(response => {
                if(!response.ok) {
                        if(response.status === 404 || response.status === 400 ) {
                            results.innerText = "Username not found";
                            results.style.color = "red";
                            document.getElementById('skin').style.display = 'none';
                            document.getElementById('cape').style.display = 'none';
                        }
                        return null;
                }
                return response.json();
            })
            .then(data => {
                if (!data) return;
                results.innerText = `${username}`;
                results.style.color = "white";
                var skinURL = data.textures.skin.url;
                if(data.textures.cape){
                    var capeURL = data.textures.cape.url;
                    var capeImg = document.getElementById('cape');
                    capeImg.src = capeURL;
                } else {
                    document.getElementById('cape').style.display = 'none';
                }
                console.log(skinURL); // For testing purposes
                console.log(capeURL);

                var skinImg = document.getElementById('skin');

                skinImg.src = skinURL;
                capeImg.src = capeURL;
            })
            
    
    })
})