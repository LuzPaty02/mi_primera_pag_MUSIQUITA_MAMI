//Open AI
async function miFuncionOpenAi(InputValue) {
  const endpoint_ai = "https://api.openai.com/v1/chat/completions";
  const opciones = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer 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",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "canciones sobre " + InputValue }],
    }),
  };

  const res = await fetch(endpoint_ai, opciones);
  return await res.json().then((data) => data.choices[0].message.content);
}


//spotify
async function miTokenSpotify(client_id, client_secret) { 
    const CLIENT_ID = client_id;
    const CLIENT_SECRET = client_secret;

  
    const endpoint_spotify_token ="https://accounts.spotify.com/api/token";

    const clientCredentials = `${encodeURIComponent(CLIENT_ID)}:${encodeURIComponent(CLIENT_SECRET)}`;
    const encodedCredentials = btoa(clientCredentials);
  
    const opciones = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent(CLIENT_ID)}&client_secret=${encodeURIComponent(CLIENT_SECRET)}`,
    };

  
    // const res = await fetch(endpoint_spotify_token, opciones);
    // return await res.json().then(data.access_token);

    const res = await fetch(endpoint_spotify_token, opciones);
    const data = await res.json();
    const accessToken = data.access_token;
    return accessToken;
}




async function miFuncionSpotify(InputValue) {
    console.log("miFuncionSpotify "+ InputValue)

    const token= await miTokenSpotify();
    var searchParameters={
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: 'Bearer '  + token
    }
  };
  const response= await fetch("https://api.spotify.com/v1/search?q=" + 
  InputValue + "&type=track&limit=5", searchParameters)


    const data = await response.json();
    const tracks = data.tracks.items;

    // Extract external links for each track
    const externalLinks = tracks.map(track => {
        return {
            name: track.name,
            artist: track.artists[0].name,
            external_url: track.external_urls.spotify
        };
    });

    console.log(externalLinks);
    console.log(typeof(externalLinks));
    return externalLinks;

}


// 
document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.querySelector("#prompt").value;
  const button = document.querySelector("#button");
  const output = document.querySelector("#output");
  const output_link = document.querySelector("#output_link");

  button.addEventListener("click", async () => {
    
    const promptInput = document.querySelector("#prompt").value;
    try {
        const result = await miFuncionOpenAi(promptInput);
        output.innerText = result;

        const getToken = await miTokenSpotify();
        console.log(getToken);

        const externalLinks = await miFuncionSpotify(promptInput);

        externalLinks.forEach(track => {
        const trackElement = document.createElement("p");
        trackElement.textContent = `${track.name} by ${track.artist}: `;

        const linkElement = document.createElement("a");
        linkElement.textContent = " Listen on Spotify";
        linkElement.href = track.external_url;
        linkElement.target = "_blank"; // Open link in a new tab

        trackElement.appendChild(linkElement);
        output_link.appendChild(trackElement);
      })

    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Retry after waiting for a certain period
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
        const result = await miFuncionOpenAi(promptInput);
        output.innerText = result;

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
        const result2 = await miFuncionSpotify(promptInput);
        output_link.innerText = result2;
      } else {
        console.error("An error occurred:", error);
      }
    }
  });
});
