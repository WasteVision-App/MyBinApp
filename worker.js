addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event);
  } catch (e) {
    let pathname = new URL(event.request.url).pathname;

    // If the request is for a path that doesn't exist as a static asset,
    // serve index.html
    if (e.status === 404) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/index.html`, req),
        });
        return new Response(notFoundResponse.body, notFoundResponse);
      } catch (e) {
        // Fallback for when index.html itself can't be found
        return new Response('Not Found', { status: 404 });
      }
    }
    // For other errors, re-throw or return a generic error
    return new Response('Internal Error', { status: 500 });
  }
}