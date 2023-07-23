
# Taylor Swift Song Recommender

## Overview

This is a web application that grabs the current authenticated user's top listened to songs on Spotify to recommend personalized songs from Taylor Swift's catalog.

## Pre-requisites

To run this application you will need:

- A [Node.js LTS](https://nodejs.org/en/) environment or later.
- A [Spotify Developer Account](https://developer.spotify.com/)
- Create .env.local file in the root directory with contents:
    ```
    VITE_SPOTIFY_CLIENT_ID=<YOUR SPOTIFY CLIENT ID>
    VITE_SPOTIFY_REDIRECT_URL=http://localhost:5173
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