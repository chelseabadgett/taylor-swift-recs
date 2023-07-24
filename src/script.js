import SpotifyApi from './spotifyApi'

const params = new URLSearchParams(window.location.search)

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_AUTHORIZATION_CODE = params.get('code')

let SPOTIFY_ACCESS_TOKEN

const getUserDisplayName = async () => {
    
    const profile = await SpotifyApi.getUserProfile(SPOTIFY_ACCESS_TOKEN)
    return profile.display_name
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
      id: item.id
    }
  })

  return recommendations.filter(item => item.artistName === `Taylor Swift`)
}

const getFinalTaylorRecommendations = async topTrackIds => {
  const uniqueRecommendationsById = {}
  let requestCount = 0

  while (
    Object.keys(uniqueRecommendationsById).length < 6 &&
    requestCount <= 5
  ) {
    let taylorRecommendations = await getTopTaylorRecommendations(topTrackIds)

    taylorRecommendations.forEach(item => {
      uniqueRecommendationsById[item.id] = item
    })

    requestCount++
  }

  return Object.values(uniqueRecommendationsById).map(item => item.externalUrl)
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

const run = async () => {
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

  const displayName = await getUserDisplayName()
  updateHeaderHtml(displayName)
  let topTrackIds = await getUsersTopTrackIds()
  let externalUrls =  await getFinalTaylorRecommendations(topTrackIds)
  await updateRecommendationHtml(externalUrls)

}

run()

