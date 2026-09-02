const fs = require('fs');

const css = fs.readFileSync('/tmp/preview/app.css', 'utf8');
const js = fs.readFileSync('/tmp/preview/app.js', 'utf8');

// A literal </script> anywhere in the bundle would close the tag early.
const safeJs = js.replace(/<\/script/gi, '<\\/script');
const safeCss = css.replace(/<\/style/gi, '<\\/style');

const html = `<title>MECANORME</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

/* the site commits to one dark industrial world — pin it so the host ground never shows through */
:root { color-scheme: dark; }
html, body { background: #080F26; margin: 0; padding: 0; }
#mn-root { min-height: 100svh; }

${safeCss}
</style>
<div id="mn-root"></div>
<script>
${safeJs}
</script>
`;

fs.writeFileSync('/tmp/preview/mecanorme.html', html);
console.log('written', (fs.statSync('/tmp/preview/mecanorme.html').size / 1024 / 1024).toFixed(2), 'MB');
