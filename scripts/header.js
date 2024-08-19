async function loadheader() {
    fetch('./components/header.html')
            .then(res => res.text())
            .then(html => {
                document.getElementById('header').innerHTML = html;
				try {
					indexReady()
				} catch {}
                caller()
            })
            .catch(e => {
                console.error('Failed to fetch header', e)
            })
} 