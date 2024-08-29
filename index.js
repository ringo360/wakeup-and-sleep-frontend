let sleeping = false;
let sleep_alr = false;
let wakeup_alr = false;
let can_fire = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        caller()
    })
} else {
    caller()
}

let called = false;
async function caller() {
    if (called === true) return;
    called = true;
    main()
	initwakeupbtn()
    console.log('Sucessfully called index.js')
}

async function initsleepbtn() {
	const x = document.getElementById('sleep')
	x.textContent = '就寝'
	switchButtonbyClassName(x, false)
}

async function initwakeupbtn() {
	const token = await getAccToken()
	const info = await getInfo(token)
	if (!info.ok) {
		console.error('response is not ok, returing...')
		return;
	}
	const json = await info.json()
	const res = await getAPI(token, json.res.user, '/v1/sleeping')
	const res_json = await res.json()
	const x = document.getElementById('wakeup')
	if (res_json.isSleeping) {
		sleeping = true
		x.textContent = '起床'
		switchButtonbyClassName(x, false)
		initsleepbtn()
	} else {
		sleeping = false
		x.textContent = '起床'
		switchButtonbyClassName(x, false)
		initsleepbtn()
	}
	await wait(50)
	can_fire = true
}


function wait(time){return new Promise((resolve)=>{setTimeout(resolve, time)})}

async function fire(x) {
	if (!can_fire) return;
    console.log(sleeping)
    if (sleeping === true) {
        wakeup(x)
        return;
    }
    if (sleeping === false) {
        sleep(x)
        return;
    }
    else {
        return;
    }
}

async function sleep(x) {
    if (sleep_alr === true) {
        return;
    }
    sleep_alr = true;
    // x.value = 'It works!'
    await addList('sleep')
    x.textContent = '🌙'
    // x.textContent = '🌞'
    sleeping = true;
    await wait(2000)
    // x.value ='起床'
    x.textContent = '就寝'
    sleep_alr = false;
}

async function wakeup(x) {
    if (wakeup_alr === true) {
        return;
    }
    wakeup_alr = true;
    await addList('wakeup')
    // x.textContent = '🌙'
    x.textContent = '🌞'
    sleeping = false;
    await wait(2000)
    x.textContent = '起床'
    wakeup_alr = false;
}

async function addList(mode) {
    if (sleeping === false) {
        const rows = document.querySelectorAll('#slog tr');
        let row = null;

        for (const r of rows) {
            const cells = r.querySelectorAll('td');
            console.log(cells)
            console.log(cells.length)
            if (cells[cells.length - 2]) {
                console.log(cells[cells.length - 2].textContent)
            }
            if (cells.length > 0 && cells[cells.length - 2].textContent === '記録なし') {
                console.log('Matched')
                row = r;
                break;
            }
        }
        if (row) {
            const now = new Date()
            console.log(now)
			const year = now.getFullYear()
	        const mon = fmtTime(`${now.getMonth() + 1}`)
            console.log(mon)
    	    const day = fmtTime(`${now.getDate()}`)
            const hour = fmtTime(`${now.getHours()}`)
            const min = fmtTime(`${now.getMinutes()}`)
			const sec = fmtTime(`${now.getSeconds()}`)
            const time = `${hour}:${min}`
			const token = await getAccToken()
			const res = await getInfo(token)
			const json = await res.json()
			postSleepData(token, json.res.user, `${year}-${mon}-${day} ${time}:${sec}`, mode)
            row.cells[row.cells.length - 2].textContent = time;
        } else {
            console.error('oops')
        }
    } else {
        const elem = document.getElementById('slog')
        const now = new Date()
        console.log(now)
        const year = now.getFullYear()
        const mon = fmtTime(`${now.getMonth() + 1}`)
        console.log(mon)
        const day = fmtTime(`${now.getDate()}`)
        const today = `${year}/${mon}/${day}`
        const hour = fmtTime(`${now.getHours()}`)
        const min = fmtTime(`${now.getMinutes()}`)
		const sec = fmtTime(`${now.getSeconds()}`)
        const time = `${hour}:${min}`
        elem.insertAdjacentHTML(`beforeend`, `<tr><td>${today}</td><td>${time}</td><td>記録なし</td><td><input type="checkbox" id="breakfast" onclick="checkbf(tdis)"></td></tr>`)
		const token = await getAccToken()
		const res = await getInfo(token)
		if (!res.ok) {
			console.error('response is not ok, returing...')
			return;
		}
		const json = await res.json()
		postSleepData(token, json.res.user, `${year}-${mon}-${day} ${time}:${sec}`, mode)
        shouldRemove()
        //削除
        // document.getElementById('slog').firstElementChild.children[1].remove()
    }
}

async function postSleepData(token, username, date, mode) {
	let formBody = []
	const post_token = encodeURIComponent(token)
	const user = encodeURIComponent(username)
	const post_date = encodeURIComponent(date)
	formBody.push('token=' + post_token)
	formBody.push('username=' + user)
	formBody.push('date=' + post_date)
	formBody = await formBody.join("&")
	const res = await postAPI(formBody, `/v1/${mode}`)
	if (res.ok) return true;
	else return false;
}

async function shouldRemove() {
    const table = document.getElementById('slog');
    const rows = table.getElementsByTagName('tr');
    const len = rows.length - 1;  // ヘッダ行を除外してカウント
    if (len > 7) {
        const firstRow = rows[1]; // ヘッダ行の次の行を取得
		if (firstRow) {
            firstRow.remove();
		}
    }
}

const fmtTime = ( val, text = "0", before = true ) => {
    const repeatText = text.repeat(2);
    const fromTo = (before) ?
                { text : repeatText + val , from : -2 , to : val.length + 2}
                : { text : val + repeatText , from : 0 , to :  2};

    return fromTo.text.slice( fromTo.from , fromTo.to );
}

async function fetchSleepData() {
    console.log('Fetching sleep data');
    const token = await getAccToken();
    const info = await getInfo(token);

    if (!info.ok) {
        console.error('response is not ok, returning...');
        return;
    }

    const json = await info.json();
    const res = await getSleepRes(token, json.res.user);
    const data = await res.json();

    // 日付ごとに一番遅い時間を抽出する
    const latestRecords = Object.values(data)
        .filter(record => record.sleepdate && record.wakeupdate) // nullを無視
        .reduce((acc, record) => {
            const sleepDate = new Date(record.sleepdate);
            const wakeupDate = new Date(record.wakeupdate);

            const dateKey = sleepDate.toISOString().split('T')[0]; // 日付だけをキーとして使用

            if (!acc[dateKey] || sleepDate > new Date(acc[dateKey].sleepdate)) {
                acc[dateKey] = {
                    sleepdate: record.sleepdate,
                    wakeupdate: record.wakeupdate
                };
            }

            if (record.wakeupdate && (!acc[dateKey].wakeupdate || wakeupDate > new Date(acc[dateKey].wakeupdate))) {
                acc[dateKey].wakeupdate = record.wakeupdate;
            }

            return acc;
        }, {});

    // 結果をテーブルに追加
    const table = document.getElementById('slog');

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    Object.values(latestRecords).forEach(record => {
        const sleepdate = new Date(record.sleepdate);
        const wakeupdate = record.wakeupdate ? new Date(record.wakeupdate) : null;

        const row = document.createElement('tr');

        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(sleepdate);
        row.appendChild(dateCell);

        const sleepTimeCell = document.createElement('td');
        sleepTimeCell.textContent = sleepdate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        row.appendChild(sleepTimeCell);

        const wakeupTimeCell = document.createElement('td');
        wakeupTimeCell.textContent = wakeupdate ? wakeupdate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '記録なし';
        row.appendChild(wakeupTimeCell);

        const checkCell = document.createElement('td');
        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.onclick = checkbf(this);
        checkCell.appendChild(checkBox);
        row.appendChild(checkCell);

        table.appendChild(row);
    });
}


//TODO: うまくつかう
function calculateTimeDifference(sleepDate, wakeUpdate) {
    const sleepDateTime = new Date(sleepDate);
    const wakeUpdateDateTime = new Date(wakeUpdate);
  
    const timeDifference = wakeUpdateDateTime.getTime() - sleepDateTime.getTime();
  
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
  
    if (hours > 0) {
      return `${hours}時間`;
    } else if (minutes > 0) {
      return `${minutes}分`;
    } else {
      return `${seconds}秒`;
    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}
