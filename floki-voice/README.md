# floki-voice

Floki's voice: [Piper](https://github.com/OHF-Voice/piper1-gpl) text to speech behind a small HTTP server, voice `en_US-ryan-medium` (male). Only the site's `speakFloki` server function calls it, over the server's private Docker network. It never gets a public domain.

- Endpoint the site uses: `POST /synthesize` with `{ "text": "..." }`, answering with a WAV file.
- Size: about 150 MB of RAM and under a second per line on 2 vCPU.
- Another voice: change the `VOICE` build arg. Listen to them at [rhasspy.github.io/piper-samples](https://rhasspy.github.io/piper-samples/).

## Environment variables on the site

| Variable | Value |
| --- | --- |
| `FLOKI_GROQ_API_KEY` | Groq API key ([console.groq.com/keys](https://console.groq.com/keys)) |
| `FLOKI_TTS_URL` | This service's internal URL, for example `http://floki-voice:5000` |

Without `FLOKI_GROQ_API_KEY`, Floki answers "comms down". Without `FLOKI_TTS_URL`, he answers in text only.

## Deploy on Coolify

1. In the project that holds the site, add a resource: **Application** from this GitHub repo, branch `main`.
2. Build pack: **Dockerfile**. Base directory: `/floki-voice`. Port: `5000`.
3. Leave **Domains** empty, so the service stays private.
4. Deploy. Coolify puts it on the server's `coolify` Docker network.
5. Copy its container name, or set a network alias such as `floki-voice` under the resource's network settings.
6. On the site's resource, set `FLOKI_TTS_URL=http://<that name>:5000` and `FLOKI_GROQ_API_KEY`, then redeploy the site.

Check it from the site's container (Coolify's terminal):

```sh
wget -qO /dev/null --post-data='{"text":"Floki online."}' --header='Content-Type: application/json' "$FLOKI_TTS_URL/synthesize" && echo voice ok
```

## Doing it with Claude Code on the server

Run `claude` on the server and paste:

> Deploy Floki's voice service for gh44.dev. The site runs on this server under Coolify. The repo has `floki-voice/Dockerfile` (Piper TTS HTTP server on port 5000), described in `floki-voice/README.md`. Add it as a private Coolify application next to the site, with no public domain, using the Dockerfile build pack and base directory `/floki-voice`. Make sure the site's container can reach it, and tell me the internal URL to set as `FLOKI_TTS_URL`. Ask me before changing anything on the site's resource. Don't print secrets. The box has 2 vCPU and 4 GB RAM, so check that free memory stays above 500 MB after the deploy.
