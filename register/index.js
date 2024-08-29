const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const regex = /^[0-9a-zA-Z]+$/;

//tysm - https://stackoverflow.com/questions/35325370/how-do-i-post-a-x-www-form-urlencoded-request-using-fetch

async function register() {
	const btn = document.getElementById('registerbtn')
	btn.textContent = '登録中...'
	switchButtonbyClassName(btn, true)
	const usr = await document.getElementById('user')
	const pass = await document.getElementById('pass')
	console.log(regex.test(usr.value))
	console.log(regex.test(pass.value))
	if (!regex.test(usr.value) || !regex.test(pass.value)) {
		switchButtonbyClassName(btn, false)
		btn.textContent = '登録'
		return showresult(false, '使えない文字が含まれています！')
	}
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
	const res = await postAPI(formBody, '/auth/register')
	if (!res.ok) {
		if (res.status === 400) {
			const json = await res.json()
			console.log(json)
			if (json.Result === 'Already exists') {
				showresult(false, 'そのユーザーは既に存在します！')
			} else if (json.Result === 'Invalid Request') {
				showresult(false, 'エラーが発生しました(値が無効です！)')
			} else {
				showresult(false, `エラーが発生しました(${json.Result})`)
			}
			btn.textContent = '登録'
			switchButtonbyClassName(btn, false)
		} else {
			btn.textContent = '登録'
			showresult(false, `内部エラーが発生しました(${res.status})`)
			switchButtonbyClassName(btn, false)
		}
	} else {
		btn.textContent = '登録'
		showresult(true)
		switchButtonbyClassName(btn, false)
	}

}
async function showresult(isSuccess, msg = 'Failed!') {
	console.log('Appending...')
	if (isSuccess === true) {
		const elem = document.getElementById('register')
		elem.insertAdjacentHTML('beforebegin', '<h1 class="result success">作成しました！</h1>')
		await delay(1000)
		const addedElem = document.querySelector('.result.success')
		if (addedElem) {
			addedElem.remove()
		}
		location.href = '../login/index.html'
	} else {
		
		const elem = document.getElementById('register')
		elem.insertAdjacentHTML('beforebegin', `<h1 class="result fail">${msg}</h1>`)
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
				console.log('戻る/進むによるアクセス on register');
				location.href = '/'
				break;
			case 'prerender':
				console.log('レンダリング前');
				break;
			}
	});
}; 