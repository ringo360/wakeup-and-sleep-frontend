//*User Manager
const userinfo = {
    username: null,
    exp: null,
}

async function UserManInit() {
    try {
        const cookie = await getAccToken()
        const info = await UM_auth(cookie)
        if (info === null) return location.href = '../login/index.html'
        userinfo.username = info.user;
        userinfo.exp = info.exp;
        return true;
    } catch (e) {
        console.error(e)
        return false;
    }
}




/**
 * 
 * @param cookie 
 * @returns Object {
 *   exp: UnixDate,
 *   password: str,
 *   user: str
 * }
 */
async function UM_auth(c) {
    const res = await getInfo(c)
    if (res.ok) {
        const j = await res.json()
        return j.res
    } else {
        return null;
    }
}