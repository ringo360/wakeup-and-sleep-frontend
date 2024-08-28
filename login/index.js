const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//tysm - https://stackoverflow.com/questions/35325370/how-do-i-post-a-x-www-form-urlencoded-request-using-fetch

async function login() {
	const btn = document.getElementById('btn')
	btn.textContent = 'ログイン中...'
	switchButton(btn, true)
	const usr = await document.getElementById('user')
	const pass = await document.getElementById('pass')
	const details = {
		'username': usr.value,
		'password': pass.value
	}
	let formBody = []
	for (let prop in details) {
		let encodedKey = encodeURIComponent(prop)
		let encodedVal = encodeURIComponent(details[prop])
		formBody.push(encodedKey + "=" + encodedVal)
	}
	formBody = formBody.join("&")
	const res = await try_login(formBody)
	const json = await res.json()
	//login check
	if (res.status === 200) {
		console.log('Success')
		document.cookie = `RefT=${json.t}; path=/`
		document.cookie = `Name=${usr.value}; path=/`
		// await delay(500) delay
		const acc_json = await fetch_accToken(json.t)
		document.cookie = `AccT=${acc_json.t}; path=/`
		btn.textContent = 'ログイン'
		showresult(true)
		btn.textContent = 'ログイン'
		switchButton(btn, false)
	} else {
		btn.textContent = 'ログイン'
		showresult(false)
		btn.textContent = 'ログイン'
		switchButton(btn, false)
	}
}
async function showresult(isSuccess) {
	console.log('Appending...')
	if (isSuccess === true) {
		const elem = document.getElementById('login')
		elem.insertAdjacentHTML('beforebegin', '<h1 class="result success">ログインしました！</h1>')
		await delay(1000)
		const addedElem = document.querySelector('.result.success')
		if (addedElem) {
			addedElem.remove()
		}
		location.href = '../index.html'
	} else {
		
		const elem = document.getElementById('login')
		elem.insertAdjacentHTML('beforebegin', '<h1 class="result fail">ユーザー・パスワードが違います</h1>')
		await delay(2000)
		const addedElem = document.querySelector('.result.fail')
		if (addedElem) {
			addedElem.remove()
		}
	}
}
const currentPageUrl = window.location.href;
console.log(currentPageUrl)
window.onload = function(){
	const perfEntries = performance.getEntriesByType("navigation");
	perfEntries.forEach(function(pe){
		switch( pe.type ){
			case 'navigate':
				console.log('通常のアクセス');
				break;
			case 'reload':
				console.log('更新によるアクセス');
				break;
			case 'back_forward':
				console.log('戻る/進むによるアクセス on login');
				location.href = '/'
				break;
			case 'prerender':
				console.log('レンダリング前');
				break;
			}
	});
};