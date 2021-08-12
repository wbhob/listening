// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import qs from "qs";

const t = {
  access_token:
    "BQDNwk5Ci6666lAhoH2gGXODIV14NDufKprSqR3XH4QRbnEylsHr2kMN657Lf9jk8y09vqhdo5JbjMq_xmSiMdPUQP-CBAGNbSC_SbF5DHlB0NOWQJxAhcrkOiIkywk_JYK2OoYvayN5V8r0amHVJyC7hC356DVo",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token:
    "AQDqWXxKmtfPyNvEf3gUVzEISO4BZt15HPXNj5IP1g0kfK79H_mgvvHFqzfxOyKHtY5l0dlpWhor9jKTNx77Xa17HAuqe34VJQYmxbnSLE9hvvU6vkJj6hX1aILVcHX7iuw",
  scope:
    "user-library-read user-read-currently-playing user-read-playback-position",
};

let refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
let accessToken = undefined;

export default async function helloAPI(req, res) {
  const { data, error } = await fetchPlaying();

  // console.log({data,error})

  if (typeof data != "undefined") {
    res.status(200).json(data);
    return;
  }

  await updateAccessToken();

  {
    const { data, error } = await fetchPlaying();

    if (typeof data != "undefined") {
      if (typeof data == "object") res.status(200).json(data);
      else res.status(200).json({ offline: true });
    } else {
      res.status(500).json(error);
    }
  }
}

async function fetchPlaying() {
  try {
    const res = await axios(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    return { data: res.data };
  } catch (e) {
    return { error: e.response.data };
  }
}

async function updateAccessToken() {
  try {
    let head = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;

    let buff = Buffer.from(head);
    let authHeader = buff.toString("base64");

    const { data } = await axios("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authHeader}`,
      },
      data: qs.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    accessToken = data.access_token;
  } catch (e) {
    console.log(e);
    return null;
  }
}
