const SPOTIFY_REDIRECT_URL = import.meta.env.VITE_SPOTIFY_REDIRECT_URL || import.meta.env.VITE_VERCEL_URL

async function getUserProfile (code) {
  const result = await fetch(`https://api.spotify.com/v1/me`, {
    headers: { Authorization: `Bearer ${code}` }
  })

  return result.json()
}

async function getTopTracks (code, options) {
  const result = await fetch('https://api.spotify.com/v1/me/top/tracks?'+ new URLSearchParams(options), {
    method: 'GET',
    headers: { Authorization: `Bearer ${code}` }
  })

  return result.json()
}

async function getTracks (code, orderedTrackIds) {
  let trackIdString = orderedTrackIds.toString()
  console.log(`trackidstring: ${trackIdString}`)
  const result = await fetch(
    `https://api.spotify.com/v1/tracks?ids=${trackIdString}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${code}` }
    }
  )

  return result.json()
}

async function getArtists (code, allArtistsIds) {
  const artistIdString = allArtistsIds.toString()
  const result = await fetch(
    `https://api.spotify.com/v1/artists?ids=${artistIdString}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${code}` }
    }
  )

  return result.json()
}

async function getRecommendations (code, trackIds) {
    const trackIdQueryString = trackIds.toString()
    const seedTracks = encodeURI(trackIdQueryString)
    const result = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=100&seed_artists=06HL4z0CvFAxyc27GXpf02&seed_tracks=${seedTracks}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${code}` }
      }
    )
  
    return result.json()
  }

async function getEmbed (url) {
  const result = await fetch(`https://open.spotify.com/oembed?url=${url}`)

  return result.json()
}

async function createPlaylist (code, userId, displayName) {
  let date = new Date().toLocaleDateString()

  console.log(userId)
  const data = 
  {
    "name": `Taylor Swift Recommender for: ${displayName}`,
    "description": `Your Top Taylor Recommendations as of ${date}`,
    "public":true
  }
  const result = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
  {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${code}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log(result)

  return result.json()
}

async function addItemsToPlaylist (code, playlistId, uris) {

  const data = 
    {
      "uris": uris
    }

  const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
  {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${code}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return result.json()
}

export async function redirectToAuthCodeFlow (clientId) {
    const verifier = generateCodeVerifier(128)
    const challenge = await generateCodeChallenge(verifier)
  
    localStorage.setItem('verifier', verifier)
  
    const params = new URLSearchParams()
    params.append('client_id', clientId)
    params.append('response_type', 'code')

    params.append('scope', 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private')
    params.append('redirect_uri', SPOTIFY_REDIRECT_URL)

    params.append('code_challenge_method', 'S256')
    params.append('code_challenge', challenge)
  
    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`

  }
  
  export async function getAccessToken (clientId, code) {
    
    const verifier = localStorage.getItem('verifier')
  
    const params = new URLSearchParams()
    params.append('client_id', clientId)
    params.append('grant_type', 'authorization_code')
    params.append('code', code)
    params.append('redirect_uri', SPOTIFY_REDIRECT_URL)
    params.append('code_verifier', verifier)
  
    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    })
  
    const { access_token } = await result.json()
  
    localStorage.setItem('spotify_access_token', access_token)
  
    return access_token
  }
  
  function generateCodeVerifier (length) {
    let text = ''
    let possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }
  
  async function generateCodeChallenge (codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
  

export default {
  getUserProfile,
  createPlaylist,
  addItemsToPlaylist,
  getTopTracks,
  getTracks,
  getArtists,
  getRecommendations,
  getEmbed,
  redirectToAuthCodeFlow,
  getAccessToken
}
