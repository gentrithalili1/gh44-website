import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";

import { createFileRoute } from "@tanstack/react-router";

import { getByteRange } from "./utils/byteRange";

// The radio's tracks are not in git, so the build has none. On the server they live in a folder
// mounted at AUDIO_DIR; locally Vite serves public/audio before this route is reached.
const DEFAULT_AUDIO_DIR = "public/audio";
// Plain names only, so a request cannot climb out of the folder.
const TRACK_FILE = /^[a-z0-9-]+\.mp3$/;
const ONE_DAY_SECONDS = 86_400;

function notFound() {
  return new Response("not found", { status: 404 });
}

async function getFileSize(path: string) {
  try {
    return (await stat(path)).size;
  } catch {
    // Missing or unreadable: the caller answers 404.
    return undefined;
  }
}

// The file's bytes from `start` to `end` (inclusive), read as the response pulls them.
function streamFile({ path, start, end }: { path: string; start: number; end: number }) {
  const fileStream = createReadStream(path, { start, end });
  const chunks: AsyncIterator<unknown> = fileStream[Symbol.asyncIterator]();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const chunk = await chunks.next();
      if (chunk.done) {
        controller.close();
        return;
      }
      if (chunk.value instanceof Uint8Array) controller.enqueue(chunk.value);
    },
    cancel() {
      fileStream.destroy();
    },
  });
}

async function serveTrack({ file, request }: { file: string; request: Request }) {
  if (!TRACK_FILE.test(file)) return notFound();
  const path = join(process.env.AUDIO_DIR ?? DEFAULT_AUDIO_DIR, file);
  const size = await getFileSize(path);
  if (size === undefined) return notFound();

  const headers = {
    "Content-Type": "audio/mpeg",
    "Accept-Ranges": "bytes",
    "Cache-Control": `public, max-age=${ONE_DAY_SECONDS}`,
  };
  const range = getByteRange({ header: request.headers.get("range"), size });
  switch (range.status) {
    case "whole":
      return new Response(streamFile({ path, start: 0, end: size - 1 }), {
        headers: { ...headers, "Content-Length": String(size) },
      });
    case "partial":
      return new Response(streamFile({ path, start: range.start, end: range.end }), {
        status: 206,
        headers: {
          ...headers,
          "Content-Length": String(range.end - range.start + 1),
          "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
        },
      });
    case "unsatisfiable":
      return new Response(null, {
        status: 416,
        headers: { ...headers, "Content-Range": `bytes */${size}` },
      });
    default: {
      const unknownRange: never = range;
      return unknownRange;
    }
  }
}

export const Route = createFileRoute("/audio/$file")({
  server: {
    handlers: {
      GET: ({ params, request }) => serveTrack({ file: params.file, request }),
    },
  },
});
