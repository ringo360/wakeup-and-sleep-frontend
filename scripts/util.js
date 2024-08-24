
function switchButton(elem, bool) {
	if (bool) {
		elem.id = 'graybtn'
	} else {
		elem.id = 'btn'
	}
}

async function launchFireworks(time) {
    fireworks.start()
	await wait(time)
	fireworks.waitStop(true)
}
