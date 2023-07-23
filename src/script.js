// Because this is a literal single page application
// we detect a callback from Spotify by checking for the hash fragment
import { redirectToAuthCodeFlow, getAccessToken } from './authCodeWithPkce'

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const params = new URLSearchParams(window.location.search)
const code = params.get('code')

if (!code) {
  redirectToAuthCodeFlow(clientId)
  console.log(`i got here`)
} else {
  let accessToken = localStorage.getItem('spotify_access_token')
  console.log(`this route ${accessToken}`)

  if (!accessToken) {
    accessToken = await getAccessToken(clientId, code)
  }

  const topTracks = await getTopTracks(accessToken)
  console.log(topTracks)
  //console.log(topTracks.items[0].name)
  let allTrackNames = Object.values(topTracks)[0]
  console.log(allTrackNames)
  let trackCleanedFields = allTrackNames.map(item => {
    return {
      name: item.name,
      artist: item.artists[0].name,
      link: item.href,
      id: item.id
    }
  })
  let orderedTrackIds = trackCleanedFields.map(item => item.id)
  console.log(orderedTrackIds)

  console.log(trackCleanedFields)

  const trackInfo = await getTracks(accessToken, orderedTrackIds)
  const allTrackInfo = Object.values(trackInfo)[0]
  const allTrackInfoOrdered = allTrackInfo.map(item => {
    return {
      albumImage: item.album.images[0].url,
      artistId: item.artists[0].id
    }
  })
  const allArtistsIds = allTrackInfoOrdered.map(item => item.artistId)
  const artistInfo = await getArtists(accessToken, allArtistsIds)
  const allArtistInfo = Object.values(artistInfo)[0]
  console.log(artistInfo)
  const allArtistInfoOrdered = allArtistInfo.map(item => {
    return {
      artistName: item.name,
      artistId: item.id,
      genres: item.genres,
      genreCount: item.genres.length
    }
  })
  console.log(allArtistInfoOrdered)
  let genreString = `rap`
  const trackRecommendation = await getSearchResults(accessToken, genreString)
  const allRecommendationInfo = Object.values(trackRecommendation)[0].items
  console.log(allRecommendationInfo)

  const allRecommendationInfoOrdered = allRecommendationInfo.map(item => {
    return {
      albumName: item.album.name,
      albumImage: item.album.images[0],
      albumLink: item.href,
      songName: item.name,
      url: item.external_urls.spotify
    }
  })

  const externalUrlsOrdered = allRecommendationInfoOrdered.map(item => {
    return item.url
  })

  const hmtlList = []

  for (const url of externalUrlsOrdered) {
    const hmtlData = await getSpotifyEmbed(url)
    const currentHTML = Object.values(hmtlData)[0]
    hmtlList.push(currentHTML)
  }

  // Cached UI Variables
  const div1 = document.querySelector(`.div1`)
  const div2 = document.querySelector(`.div2`)
  const div3 = document.querySelector(`.div3`)
  const div4 = document.querySelector(`.div4`)
  const div5 = document.querySelector(`.div5`)
  const div6 = document.querySelector(`.div6`)

  div1.innerHTML = hmtlList[0]
  div2.innerHTML = hmtlList[1]
  div3.innerHTML = hmtlList[3]
  div4.innerHTML = hmtlList[4]
  div5.innerHTML = hmtlList[5]
  div6.innerHTML = hmtlList[6]

  console.log(htmlList)
  //const currentUrl = await getSpotifyEmbed(allRecommendationInfoOrdered[0].url)
  //   const currentHTML = Object.values(currentUrl)[0]
  //   console.log(currentHTML)

  console.log(allRecommendationInfoOrdered)
  //populateUI(profile)
}

async function fetchProfile (code) {
  const result = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${code}` }
  })

  return await result.json()
}

async function getTopTracks (code) {
  const result = await fetch('https://api.spotify.com/v1/me/top/tracks', {
    method: 'GET',
    headers: { Authorization: `Bearer ${code}` }
  })

  const topTracks = result.json()

  return topTracks
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

  const trackInfo = result.json()

  return trackInfo
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

  const artistInfo = result.json()

  return artistInfo
}

async function getSearchResults (code, genreString) {
  const queryString = encodeURI(`artist:"taylor swift"&type=track`)
  const result = await fetch(
    `https://api.spotify.com/v1/search?q=${queryString}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${code}` }
    }
  )

  const trackRecommendation = result.json()

  return trackRecommendation
}

async function getSpotifyEmbed (url) {
  const result = await fetch(`https://open.spotify.com/oembed?url=${url}`)

  return result.json()
}
