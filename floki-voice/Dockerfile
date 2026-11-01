# Floki's voice: Piper text to speech over HTTP, for the site's speakFloki server function only.
# Keep it on the private network: no public domain.
FROM python:3.12-slim

ARG PIPER_VERSION=1.8.0
ARG VOICE=en_US-ryan-medium

RUN pip install --no-cache-dir "piper-tts[http]==${PIPER_VERSION}"

WORKDIR /voices
RUN python -m piper.download_voices "${VOICE}"

ENV VOICE=${VOICE}
EXPOSE 5000
CMD ["sh", "-c", "python -m piper.http_server --host 0.0.0.0 --port 5000 -m \"$VOICE\" --data-dir /voices"]
