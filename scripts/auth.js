console.log('Called auth.js')

const baseurl = 'https://was-api.a1z.uk/'
let fail =0;

let readyindex = false;

function indexReady() {
	readyindex = true;
}

async function main() {
    const cookie = await getAccToken()
    const res = await getInfo(cookie)
    
    if (res.status !== 200) {
        fail++;
        console.log(`Retrying (${fail})`)
        if (res.status === 401) {
            if (fail === 3) {
                console.log('[!] Failed to login.')
                goLogin()
            }
            const acc_json = await fetch_accToken()
            document.cookie = `AccT=${acc_json.t}; path=/`
            main()
            return;
        } else {
            goLogin()
        }
    } else {
		console.log('Calling sleep data')
		fetchSleepData()
        const json = await res.json()
        append(json.res.user, true)
    }
}

function getInfo(cookie) {
	return fetch(`${baseurl}/auth/info`, {
        method: 'GET',
        mode: 'cors',
        cache: "no-cache",
        headers: {
            'User-Agent': 'WakeApp/1.0',
            'X-Token': cookie,
			'Access-Control-Allow-Origin': '*'
        },
    })
}

async function fetch_accToken(ref_token) {
	if (!ref_token) ref_token = await getRefToken()
	const acc_res = await fetch(`${baseurl}/auth/acctoken`, {
		method: 'GET',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'WakeApp/1.0',
			'X-Token': ref_token,
			'Access-Control-Allow-Origin': '*'
		}
	})
	const acc_json = acc_res.json()
	return acc_json;
}

async function append(x, is) {
	while (!readyindex) {
		console.warn('Index is not ready. sleeping...')
		await sleep(100)
	}
    const elem = document.getElementById('user')
    if (is === true) {
        elem.insertAdjacentHTML('afterbegin', `<p>${x} | <a onclick="logout()">Logout</a></p>`)
    } else {
        elem.insertAdjacentHTML('afterbegin', `<p><a href='../login/index.html'>Login</a></p>`)
    }
}
function goLogin() {
    location.href = '../login/index.html'
}
function isValidToken(cookie) {
	const res = fetch(`${baseurl}/auth/info`, {
        method: 'GET',
        mode: 'cors',
        cache: "no-cache",
        headers: {
            'User-Agent': 'WakeApp/1.0',
            'X-Token': cookie,
			'Access-Control-Allow-Origin': '*'
        },
    })
	if (res.ok) return true;
	else return false;
}

async function getAccToken() {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`AccT=`))
        ?.split("=")[1];
	if (!isValidToken(cookieValue)) {
		console.warn('Token is not valid. regenerating..')
		const acc_json = await fetch_accToken()
        document.cookie = `AccT=${acc_json.t}; path=/`
		return acc_json.t
	}
    else return cookieValue
}
function getRefToken() {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`RefT=`))
        ?.split("=")[1];
    return cookieValue
}
async function logout() {
    document.cookie = `AccT=null; max-age=0; path=/`
    document.cookie = `RefT=null; max-age=0; path=/`
    document.cookie = `Name=null; max-age=0; path=/`
    location.href = '/'
}

async function try_login(formBody) {
	const res = await fetch(`${baseurl}/auth/login`, {
		method: 'POST',
		mode: 'cors',
		cache: "no-cache",
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			'User-Agent': 'WakeApp/1.0',
			'Access-Control-Allow-Origin': '*'
		},
		body: formBody
	})
	return res;
}

async function postAPI(formBody, path = '/') {
	return await fetch(`${baseurl}${path}`, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			'User-Agent': 'WakeApp/1.0',
			'Access-Control-Allow-Origin': '*'
		},
		body: formBody
	})
}


async function getSleepRes(token, username) {
	return await fetch(`${baseurl}/v1/sleep`, {
		method: 'GET',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			'User-Agent': 'WakeApp/1.0',
			'X-Token': token,
			'X-UserName': username,
			'Access-Control-Allow-Origin': '*'
		},
	})
}

async function getAPI(token, username, path = '/') {
	return await fetch(`${baseurl}${path}`, {
		method: 'GET',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			'User-Agent': 'WakeApp/1.0',
			'X-Token': token,
			'X-UserName': username,
			'Access-Control-Allow-Origin': '*'
		},
	})
}

async function deleteAPI(token, username, path = '/') {
	return await fetch(`${baseurl}${path}`, {
		method: 'DELETE',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			'User-Agent': 'WakeApp/1.0',
			'X-Token': token,
			'X-UserName': username,
			'Access-Control-Allow-Origin': '*'
		},
	})
}