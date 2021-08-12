// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios'

export default function helloAPI(req, res) {
  axios("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: {
      "Authorization": `Bearer ${process.env.SPOTIFY_TOKEN}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  }).then(({ data }) => {
    res.status(200).json(data)
  }).catch(e => {

    console.log(e.response.data.error)
    // console.log(e.toJSON())
    
    res.status(500).json(e)
  })
}
