console.log('Called auth.js')

let fail =0;


async function main() {
    const cookie = getAccToken()
    console.log('cookie:' + cookie)
    const res = await fetch('https://p-dev.ringoxd.dev/auth/info', {
        method: 'GET',
        mode: 'cors',
        cache: "no-cache",
        headers: {
            'User-Agent': 'WakeApp/1.0',
            'X-Token': cookie
        },
    })
    
    if (res.status !== 200) {
        fail++;
        console.log(`Retrying (${fail})`)
        if (res.status === 401) {
            if (fail === 3) {
                console.log('Failed to login.')
                return append('Login', false);
            }
            const acc_res = await fetch('https://p-dev.ringoxd.dev/auth/acctoken', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'WakeApp/1.0',
                 'X-Token': await getRefToken()
                }
            })
            const acc_json = await acc_res.json()
            document.cookie = `AccT=${acc_json.t}; path=/`
            main()
            return;
        } else {
            append('Login', false)
        }
    } else {
        const json = await res.json()
        console.log(json)
        append(json.res.user, true)
    }
}
async function append(x, is) {
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
function getAccToken() {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`AccT=`))
        ?.split("=")[1];
    return cookieValue
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