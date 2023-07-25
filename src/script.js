import SpotifyApi from './spotifyApi'

const params = new URLSearchParams(window.location.search)

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_AUTHORIZATION_CODE = params.get('code')

let SPOTIFY_ACCESS_TOKEN

let currentRecommendationMetadata = {}

const getUserDetails = async () => {
  const profile = await SpotifyApi.getUserProfile(SPOTIFY_ACCESS_TOKEN)
  return {
    displayName: profile.display_name,
    userId: profile.id
  }
}

const getUsersTopTrackIds = async () => {
  const topTracks = await SpotifyApi.getTopTracks(SPOTIFY_ACCESS_TOKEN, {
    limit: 4
  })
  const displayedTracks = topTracks.items.map(item => {
    return {
      artistName: item.artists[0].name,
      songName: item.name
    }
  })
  console.log(`toptracks`, displayedTracks)

  return topTracks.items.map(item => item.id)
}

const getTopTaylorRecommendations = async topTrackIds => {
  let recommendations = await SpotifyApi.getRecommendations(
    SPOTIFY_ACCESS_TOKEN,
    topTrackIds
  )

  recommendations = recommendations.tracks.map(item => {
    return {
      artistName: item.artists[0].name,
      externalUrl: item.external_urls.spotify,
      songName: item.name,
      id: item.id,
      uri: item.uri
    }
  })

  return recommendations.filter(item => item.artistName === `Taylor Swift`)
}

const getFinalTaylorRecommendations = async topTrackIds => {
  const uniqueRecommendationsById = {}
  let requestCount = 0
  const numberOfRecommendations = 6

  while (
    Object.keys(uniqueRecommendationsById).length < numberOfRecommendations &&
    requestCount <= 5
  ) {
    let taylorRecommendations = await getTopTaylorRecommendations(topTrackIds)

    taylorRecommendations.forEach(item => {
      uniqueRecommendationsById[item.id] = item
    })

    requestCount++
  }

  return Object.values(uniqueRecommendationsById).slice(
    0,
    numberOfRecommendations
  )
}

const updateRecommendationHtml = async externalUrls => {
  const htmlEmbedPromises = externalUrls.map(async url => {
    return await SpotifyApi.getEmbed(url)
  })

  const htmlEmbeds = (await Promise.all(htmlEmbedPromises)).map(
    item => item.html
  )

  const playerCardDivs = document.querySelectorAll(`div.main div`)
  playerCardDivs.forEach((div, currentIndex) => {
    div.innerHTML = htmlEmbeds[currentIndex]
  })
}

const updateHeaderHtml = displayName => {
  if (displayName) {
    const headerParagraph = document.querySelector(`h1`)
    headerParagraph.innerHTML = `👋 Hello, ${displayName}.`
  }
}

const updateLinkDiv = async (playlistId) => {
  const link = document.querySelector(`.link a`)
  const linkDiv = document.querySelector(`.link`)
  const linkText = document.querySelector(`.link p`)
  link.href = `https://open.spotify.com/playlist/${playlistId}`
  link.innerHTML = `https://open.spotify.com/playlist/${playlistId} <svg xmlns="http://www.w3.org/2000/svg" height="0.75em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#A9BD93}</style><path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"/></svg>`
  //linkDiv.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill:#f0f2f5}</style><path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"/></svg>`
  linkDiv.style.opacity = `1`;
}

const createPlaylist = async playlist => {
  const playlistResponse = await SpotifyApi.createPlaylist(
    SPOTIFY_ACCESS_TOKEN,
    playlist.userId,
    playlist.displayName
  )
  
  await SpotifyApi.addItemsToPlaylist(
    SPOTIFY_ACCESS_TOKEN,
    playlistResponse.id,
    playlist.uris
  )

  updateLinkDiv(playlistResponse.id)
}


const addButtonEventListener = () => {
  const playListButton = document.querySelector(`.glow-on-hover`)

  playListButton.addEventListener(`click`, async element => {
    createPlaylist(currentRecommendationMetadata)
  })
}

const runRecommenderAndUpdateUI = async () => {
  if (!SPOTIFY_AUTHORIZATION_CODE) {
    SpotifyApi.redirectToAuthCodeFlow(SPOTIFY_CLIENT_ID)
  } else {
    SPOTIFY_ACCESS_TOKEN = localStorage.getItem('spotify_access_token')

    if (!SPOTIFY_ACCESS_TOKEN) {
      SPOTIFY_ACCESS_TOKEN = await SpotifyApi.getAccessToken(
        SPOTIFY_CLIENT_ID,
        SPOTIFY_AUTHORIZATION_CODE
      )
    }
  }

  addButtonEventListener()
  
  const user = await getUserDetails()

  updateHeaderHtml(user.displayName)

  let usersTopTrackIds = await getUsersTopTrackIds()
  let taylorRecommendations = await getFinalTaylorRecommendations(usersTopTrackIds)
  let externalUrls = taylorRecommendations.map(item => item.externalUrl)
  
  await updateRecommendationHtml(externalUrls)
  
  let topTaylorUris = taylorRecommendations.map(item => item.uri)
  
  currentRecommendationMetadata = {
    uris: topTaylorUris,
    displayName: user.displayName,
    userId: user.userId
  }
}

runRecommenderAndUpdateUI()
