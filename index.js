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
    loadheader()
    main()
	initbtn()
    console.log('Sucessfully called index.js')
}
async function loadheader() {
    fetch('./components/header.html')
            .then(res => res.text())
            .then(html => {
                document.getElementById('header').innerHTML = html;
				indexReady()
                caller()
            })
            .catch(e => {
                console.error('Failed to fetch header', e)
            })
} 

async function initbtn() {
	const token = await getAccToken()
	const info = await getInfo(token)
	if (!info.ok) {
		console.error('response is not ok, returing...')
		return;
	}
	const json = await info.json()
	const res = await getAPI(token, json.res.user, '/v1/sleeping')
	const res_json = await res.json()
	if (res_json.isSleeping) sleeping = true
	else sleeping = false
	callbtn()
}

async function callbtn() {
    const x = document.getElementById('graybtn')
    if (sleeping) x.textContent = '就寝'
    else x.textContent = '起床'
	await wait(50)
	x.id = 'btn'
	can_fire = true;
}

function wait(time){return new Promise((resolve)=>{setTimeout(resolve, time)})}

async function fire(x) {
	if (!can_fire) return;
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
    await addList()
    x.textContent = '🌞'
    sleeping = true;
    await wait(2000)
    // x.value ='起床'
    callbtn()
    sleep_alr = false;
}

async function wakeup(x) {
    if (wakeup_alr === true) {
        return;
    }
    wakeup_alr = true;
    await addList()
    x.textContent = '🌙'
    sleeping = false;
    await wait(2000)
    callbtn()
    wakeup_alr = false;
}

async function addList() {
    if (sleeping === true) {
        const rows = document.querySelectorAll('#slog tr');
        let row = null;

        for (const r of rows) {
            const cells = r.querySelectorAll('td');
            if (cells.length > 0 && cells[cells.length - 1].textContent === 'N/A') {
                row = r;
                break;
            }
        }
        if (row) {
            const now = new Date()
			const year = now.getFullYear()
	        const mon = fmtTime(`${now.getMonth()}`)
    	    const day = fmtTime(`${now.getDay()}`)
            const hour = fmtTime(`${now.getHours()}`)
            const min = fmtTime(`${now.getMinutes()}`)
			const sec = fmtTime(`${now.getSeconds()}`)
            const time = `${hour}:${min}`
			const token = await getAccToken()
			const res = await getInfo(token)
			const json = await res.json()
			postSleepData(token, json.res.user, `${year}-${mon}-${day} ${time}:${sec}`)
            row.cells[row.cells.length - 1].textContent = time;
        } else {
            console.error('oops')
        }
    } else {
        const elem = document.getElementById('slog')
        const now = new Date()
        const year = now.getFullYear()
        const mon = fmtTime(`${now.getMonth()}`)
        const day = fmtTime(`${now.getDay()}`)
        const today = `${year}/${mon}/${day}`
        const hour = fmtTime(`${now.getHours()}`)
        const min = fmtTime(`${now.getMinutes()}`)
		const sec = fmtTime(`${now.getSeconds()}`)
        const time = `${hour}:${min}`
        elem.insertAdjacentHTML(`beforeend`, `<tr><td>${today}</td><td>${time}</td><td>N/A</td></tr>`)
		const token = await getAccToken()
		const res = await getInfo(token)
		if (!res.ok) {
			console.error('response is not ok, returing...')
			return;
		}
		const json = await res.json()
		postSleepData(token, json.res.user, `${year}-${mon}-${day} ${time}:${sec}`)
        shouldRemove()
        //削除
        // document.getElementById('slog').firstElementChild.children[1].remove()
    }
}

async function postSleepData(token, username, date) {
	let formBody = []
	const post_token = encodeURIComponent(token)
	const user = encodeURIComponent(username)
	const post_date = encodeURIComponent(date)
	formBody.push('token=' + post_token)
	formBody.push('username=' + user)
	formBody.push('date=' + post_date)
	formBody = await formBody.join("&")
	const res = await postAPI(formBody, '/v1/sleep')
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
			/*
			const token = await getAccToken()
			const info = await getInfo(token)
			if (!info.ok) {
				console.error('response is not ok, returing...')
				return;
			}
			const json = await info.json()
			await deleteAPI(token, json.res.user, '/v1/sleep')
			*/
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
        console.error('response is not ok, returing...');
        return;
    }

    const json = await info.json();
    const res = await getSleepRes(token, json.res.user);
    const data = await res.json();


    const dataArray = Object.keys(data).map(key => ({
        ...data[key],
        id: key
    }));


    dataArray.sort((a, b) => new Date(b.sleepdate) - new Date(a.sleepdate));

    // Select the latest 7 records
    const latest7 = dataArray.slice(0, 7);
	latest7.sort((a, b) => new Date(a.sleepdate) - new Date(b.sleepdate));

    const table = document.getElementById('slog');

    // use if need
	
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
	
    latest7.forEach(record => {
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
        wakeupTimeCell.textContent = wakeupdate ? wakeupdate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        row.appendChild(wakeupTimeCell);

        table.appendChild(row);
    });
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}