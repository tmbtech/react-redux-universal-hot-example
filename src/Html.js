/**
 * TODO update this
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default (config) => {
  const {
    meta,
    link,
    title,
    styles,
    content,
    script_url,
    store
    } = config;
  return (`
<!DOCTYPE html>
<html lang="en-us">
    <head>
        <meta charset="utf-8" />
        ${meta}
        ${link}
        <title>${title}</title>
        ${styles}
    </head>
    <body>
        <div id="content">${content}</div>
        <script>window.__data=${store}</script>
        <script src="${script_url}"></script>
    </body>
</html>
`).trim();
};
