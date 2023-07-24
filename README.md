
# Taylor Swift Song Recommender

 ![image](https://github.com/chelseastephenson/taylor-swift-recs/assets/42582706/4e27ba45-2f42-439f-9cec-2947899c2009)

## Overview

This is a web application that grabs the current authenticated user's top listened to songs on Spotify to recommend personalized songs from Taylor Swift's catalog.

## Pre-requisites

To run this application you will need:

- A [Node.js LTS](https://nodejs.org/en/) environment or later.
- A Spotify account.
- A [Spotify Developer Account](https://developer.spotify.com/)
- In Spotify Developer Dashboard
    1. Click `Create App`
    2. Add `http://localhost:5173` as a Redirect Uri.
    3. Fill out all other fields as you see fit
    4. Click `Save`
    5. Copy the `Client ID` from the App Settings for the next step
- Create `.env.local` file in the root directory with contents:
    ```
    VITE_SPOTIFY_CLIENT_ID=<YOUR SPOTIFY CLIENT ID>
    ```

## Usage

1. Clone the repository
2. Run
    ```bash
    npm install
    npm run dev
    ```
## References

Follows this [repo](https://github.com/spotify/web-api-examples/tree/999766d548700de77f15b294df8b96587f313cd0/get_user_profile) to setup Spotify User Authentication.