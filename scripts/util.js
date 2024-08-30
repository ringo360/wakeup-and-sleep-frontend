
function switchButtonbyId(elem, bool) {
	if (bool) {
		elem.id = 'btn'
	} else {
		elem.id = 'graybtn'
	}
}

function switchButtonbyClassName(elem, bool) {
	if (bool) {
		// elem.classList.replace('btn', 'graybtn')
		elem.classList.remove('btn')
		elem.classList.add('graybtn')
		return;
	} else {
		// elem.classList.replace('graybtn', 'btn')
		elem.classList.remove('graybtn')
		elem.classList.add('btn')
		return;
	}
}

async function launchFireworks(time) {
    fireworks.start()
	await wait(time)
	fireworks.waitStop(true)
}
