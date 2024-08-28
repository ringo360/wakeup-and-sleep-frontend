
function switchButtonbyId(elem, bool) {
	if (bool) {
		elem.id = 'btn'
	} else {
		elem.id = 'graybtn'
	}
}

function switchButtonbyClassName(elem, bool) {
	if (bool) {
		elem.classList.replace('btn', 'graybtn')
	} else {
		elem.classList.replace('graybtn', 'btn')
	}
}