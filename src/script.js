import SpotifyApi from './spotifyApi'

const params = new URLSearchParams(window.location.search)

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_AUTHORIZATION_CODE = params.get('code')

let SPOTIFY_ACCESS_TOKEN

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
    console.log(taylorRecommendations)

    taylorRecommendations.forEach(item => {
      uniqueRecommendationsById[item.id] = item
    })

    requestCount++
  }
  console.log(uniqueRecommendationsById)

  return Object.values(uniqueRecommendationsById).slice(0, numberOfRecommendations)
}

const updateRecommendationHtml = async (externalUrls) => {
    const htmlEmbedPromises = externalUrls.map(async url => {
        return await SpotifyApi.getEmbed(url)
    })

    const htmlEmbeds = (await Promise.all(htmlEmbedPromises)).map(item => item.html)
  
  const playerCardDivs = document.querySelectorAll(`div.main div`)
  playerCardDivs.forEach((div, currentIndex) => {
      div.innerHTML = htmlEmbeds[currentIndex]
  })

}

const updateHeaderHtml = (displayName) => {
    if(displayName){
        const headerParagraph = document.querySelector(`h1`)
        headerParagraph.innerHTML = `👋 Hello, ${displayName}.`
    }
}

const runRecommenderAndUpdateUI = async () => {
  if (!SPOTIFY_AUTHORIZATION_CODE) {
    SpotifyApi.redirectToAuthCodeFlow(SPOTIFY_CLIENT_ID)
    console.log(`i got here`)
  } else {
    SPOTIFY_ACCESS_TOKEN = localStorage.getItem('spotify_access_token')

    if (!SPOTIFY_ACCESS_TOKEN) {
      SPOTIFY_ACCESS_TOKEN = await SpotifyApi.getAccessToken(
        SPOTIFY_CLIENT_ID,
        SPOTIFY_AUTHORIZATION_CODE
      )
    }
  }

  const userDetailsObject = await getUserDetails()
  const displayName = userDetailsObject.displayName
  const userId = userDetailsObject.userId
  console.log(`userId`, userId)
  updateHeaderHtml(displayName)
  let topTrackIds = await getUsersTopTrackIds()
  let taylorRecommendations =  await getFinalTaylorRecommendations(topTrackIds)
  let topTaylorUris = taylorRecommendations.map(item => item.uri)
  let externalUrls = taylorRecommendations.map(item => item.externalUrl)
  await updateRecommendationHtml(externalUrls)

  return {
      uris: topTaylorUris,
      displayName: displayName,
      id: userId
  }

}

const createPlaylist = async (appDetails) => {

    const playlistResponse = await SpotifyApi.createPlaylist(SPOTIFY_ACCESS_TOKEN, appDetails.id, appDetails.displayName)
    let playlistId = playlistResponse.id
    console.log(`playlistId`,playlistId)
    let uris = appDetails.uris
    let updatedPlaylistResponse = await SpotifyApi.addItemsToPlaylist(SPOTIFY_ACCESS_TOKEN, playlistId, uris)
    console.log(updatedPlaylistResponse)


}

let appDetails = await runRecommenderAndUpdateUI()

const playListButton = document.querySelector(`.glow-on-hover`);

playListButton.addEventListener(`click`, async element => {
    console.log(`insidePlaylistbuttonEventListener`)
    createPlaylist(appDetails);
})

    
