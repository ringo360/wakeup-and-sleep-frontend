
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

const wakeupmsg = [
	"おはようございます!今日はどんな夢を見ましたか?",
	"おはようございます!今日も素敵な一日になりますように。",
	"おはようございます!気持ちのいい朝ですね!"
]

const sleepmsg = [
	"おやすみなさい!いい夢を見られますように。",
	"今日も一日頑張りましたね。ゆっくり休んでください!",
	"素敵な夢を見て、心身ともにリフレッシュしてください..."
]

const breakfastmsg = [
	"今日は何を食べましたか?",
	"朝ごはんは一日のはじまりの活力源になります!今日も頑張りましょう!",
	"今日もご飯を食べてパワーチャージ!頑張ってください!"
]

function wakeup_randomStr() {
	return wakeupmsg[Math.floor(Math.random() * wakeupmsg.length)];
}

function sleep_randomStr() {
	return sleepmsg[Math.floor(Math.random() * sleepmsg.length)];
}

async function showmsg(str) {
	const elem = document.getElementById('msgbox')
	elem.textContent = str
	await wait(3000)
	elem.textContent = '　'
}