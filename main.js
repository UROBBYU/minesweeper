let field = document.getElementById('field');

let msgBox = document.getElementById('hud');

msgBox.build = function(title, sub, input) {
    this.children.msg.style.color = title[0];
    this.children.msg.innerText = title[1];

    this.children.submsg.innerHTML = '';
    for (let i = 0; i < sub.length; i++) {
        let span = document.createElement('span');
        span.style.color = sub[i];
        span.innerText = sub[++i];
        this.children.submsg.appendChild(span);
    }
    this.children.submsg.style.display = (this.children.submsg.innerHTML === '' ? 'none' : '');

    this.children.input.innerHTML = '';
    for (let data of input) {
        let elem = document.createElement(data.type === 'number' ? 'input' : 'span');
        elem.className = data.type;
        elem.style.setProperty('--color', data.color);
        elem.style.setProperty('--subcolor', data.subcolor);
        elem.onclick = data.action;
        if (data.type === 'number') {
            elem.type = 'number';
            elem.value = data.value;
            elem.min = data.min;
            elem.max = data.max;
        } else elem.innerText = data.text;

        this.children.input.appendChild(elem);
    }
    this.children.input.style.display = (this.children.input.innerHTML === '' ? 'none' : '');
}

let table = [];

let mines = 0;

let hidden = 0;

function* octangler(x, y) {
    yield [x-1, y-1, 'topLeft'];
    yield [x, y-1, 'top'];
    yield [x+1, y-1, 'topRight'];
    yield [x+1, y, 'right'];
    yield [x+1, y+1, 'bottomRight'];
    yield [x, y+1, 'bottom'];
    yield [x-1, y+1, 'bottomLeft'];
    yield [x-1, y, 'left'];
}

function cellExists(x, y) {
    return x >= 0 && x < table.length && y >= 0 && y < table[x].length;
}

function removeMine(x, y) {
    if (table[x][y].data.value === '☀') {
        let v = 0;
        for (const [a, b] of octangler(x, y)) {
            if (cellExists(a, b)) {
                if (table[a][b].data.value === '☀') v++;
                else table[a][b].data.value--;
                updateCell(table[a][b]);
            }
        }
        table[x][y].data.value = v;
        updateCell(table[x][y]);
    }
}

function updateCell(cell) {
    if (cell.data.type === 'flag' && cell.elem.style.userSelect !== 'none') {
        cell.elem.style.setProperty('--cell-color', 'var(--flag-color)');
        cell.elem.style.userSelect = 'none';
        cell.elem.children[1].innerText = '🏴';
    } else if (cell.data.type !== 'flag' && cell.elem.style.userSelect === 'none') {
        cell.elem.style.removeProperty('--cell-color');
        cell.elem.style.userSelect = '';
        cell.elem.children[1].innerText = '';
    }

    cell.elem.children[0].innerText = cell.data.value === 0 ? '' : cell.data.value;

    if (cell.data.center && cell.elem.children[1].className === 'center sink') {
        cell.elem.children[1].className = 'center';
        hidden++;
    } else if (!cell.data.center && cell.elem.children[1].className === 'center') {
        cell.elem.children[1].className = 'center sink';
        hidden--;
    }

    if (cell.data.topLeft && cell.elem.children[2].className === 'top-left inverted') {
        cell.elem.children[2].className = 'top-left';
    } else if (!cell.data.topLeft && cell.elem.children[2].className === 'top-left') {
        cell.elem.children[2].className = 'top-left inverted';
    }

    cell.elem.children[2].hidden = !(cell.data.top && cell.data.left);

    cell.elem.children[3].hidden = !cell.data.top;

    if (cell.data.topRight && cell.elem.children[4].className === 'top-right inverted') {
        cell.elem.children[4].className = 'top-right';
    } else if (!cell.data.topRight && cell.elem.children[4].className === 'top-right') {
        cell.elem.children[4].className = 'top-right inverted';
    }

    cell.elem.children[4].hidden = !(cell.data.top && cell.data.right);

    cell.elem.children[5].hidden = !cell.data.right;

    if (cell.data.bottomRight && cell.elem.children[6].className === 'bottom-right inverted') {
        cell.elem.children[6].className = 'bottom-right';
    } else if (!cell.data.bottomRight && cell.elem.children[6].className === 'bottom-right') {
        cell.elem.children[6].className = 'bottom-right inverted';
    }

    cell.elem.children[6].hidden = !(cell.data.bottom && cell.data.right);

    cell.elem.children[7].hidden = !cell.data.bottom;

    if (cell.data.bottomLeft && cell.elem.children[8].className === 'bottom-left inverted') {
        cell.elem.children[8].className = 'bottom-left';
    } else if (!cell.data.bottomLeft && cell.elem.children[8].className === 'bottom-left') {
        cell.elem.children[8].className = 'bottom-left inverted';
    }

    cell.elem.children[8].hidden = !(cell.data.bottom && cell.data.left);

    cell.elem.children[9].hidden = !cell.data.left;
}

function createCell(x, y, options) {
    let elem = document.createElement('div');
    elem.className = 'cell';
    elem.style.setProperty('--x', x);
    elem.style.setProperty('--y', y);
    if (options.type === 'flag') {
        elem.style.setProperty('--cell-color', 'var(--flag-color)');
        elem.style.userSelect = 'none';
    }
    elem.innerHTML = `
        <div class="value">${options.value || ''}</div>
        <div class="center" ${options.center ? '' : 'hidden=""'}>${options.type === 'flag' ? '🏴' : ''}</div>
        <div class="top-left${options.topLeft ? '' : ' inverted'}" ${options.top && options.left ? '' : 'hidden=""'}></div>
        <div class="top" ${options.top ? '' : 'hidden=""'}></div>
        <div class="top-right${options.topRight ? '' : ' inverted'}" ${options.top && options.right ? '' : 'hidden=""'}></div>
        <div class="right" ${options.right ? '' : 'hidden=""'}></div>
        <div class="bottom-right${options.bottomRight ? '' : ' inverted'}" ${options.bottom && options.right ? '' : 'hidden=""'}></div>
        <div class="bottom" ${options.bottom ? '' : 'hidden=""'}></div>
        <div class="bottom-left${options.bottomLeft ? '' : ' inverted'}" ${options.bottom && options.left ? '' : 'hidden=""'}></div>
        <div class="left" ${options.left ? '' : 'hidden=""'}></div>
    `;

    let redTable = [];
    let zeroList = [];
    let octalList = [];

    function updateTable() {
        for (let x = 0; x < field.sizeX; x++) {
            for (let y = 0; y < field.sizeY; y++) {
                if (redTable[x][y] !== null) setTimeout(() => {
                    redrawCell(x, y);
                }, redTable[x][y]);
            }
        }
    }

    function checkCell(x, y, type, del = 0) {
        if (redTable[x][y] === null) redTable[x][y] = del;
        if (type === 'octal') {
            for (let [a, b] of octangler(x, y)) {
                if (cellExists(a, b) && redTable[a][b] === null) redTable[a][b] = del;
            }
        }
        if (type === 'zero') {
            table[x][y].data.type = 'value';
            for (let [a, b] of octangler(x, y)) {
                if (cellExists(a, b) && redTable[a][b] === null) {
                    if (table[a][b].data.value === 0) {
                        zeroList.push({x: a, y: b, del: del + 50});
                    } else if (table[a][b].data.value !== '☀') {
                        table[a][b].data.type = 'value';
                        octalList.push({x: a, y: b, del: del + 50});
                    }
                }
            }
        }
    }

    let flag = false;

    function redrawAdjusted(x, y, type) {
        if (!flag) {
            redTable = [];
            for (let x = 0; x < field.sizeX; x++) {
                redTable.push([]);
                for (let y = 0; y < field.sizeY; y++) {
                    redTable[x].push(null);
                }
            }
            zeroList = [];
            octalList = [];
        }
        if (type === 'octal') {
            octalList.push({x: x, y: y});
        } else if (type === 'zero') {
            flag = true;
            if (!zeroList.length) {
                zeroList.push({x: x, y: y, type: 'zero'});
                redrawAdjusted(null, null, 'zero');
            } else {
                let updateList = zeroList;
                zeroList = [];
                for (const val of updateList) checkCell(val.x, val.y, 'zero', val.del);
                if (zeroList.length) redrawAdjusted(null, null, 'zero');
            }
        }
        for (const val of octalList) {
            if (type === 'zero') table[val.x][val.y].data.type = 'value';
            checkCell(val.x, val.y, 'octal', val.del);
        }
        flag = false;
        updateTable();
    }

    function clickL() {
        if (table[x][y].data.type === 'block') {
            if (!table.started) {
                removeMine(x, y);
                for(let [a, b] of octangler(x, y)) {
                    if (cellExists(a, b)) removeMine(a, b);
                }
                
                table.started = true;
            }
            if (table[x][y].data.value === '☀') {
                table[x][y].data.value = '💥';
                table[x][y].data.type = 'value';
                redrawAdjusted(x, y, 'octal');
                for (const arr of table) {
                    for (const cell of arr) {
                        cell.elem.onclick = null;
                        cell.elem.oncontextmenu = null;
                        if(cell.data.value === '☀') cell.elem.children[1].innerText = '☀';
                    }
                }
                let time = Date.now() - field.time;
                let mins = Math.floor(time / 1000 / 60);
                let secs = Math.floor(time / 1000) - mins * 60;
                let millis = Math.floor((time - (mins * 60 + secs) * 1000) / 100);
                mins = (mins.toString().length == 1 ? '0' : '') + mins;
                secs = (secs.toString().length == 1 ? '0' : '') + secs;
                millis = (millis.toString().length == 1 ? '0' : '') + millis;
                msgBox.build(
                    ['#fb4904', '💥Loss💥'],
                    ['lime', `Size: ${field.sizeX}x${field.sizeX}`,
                     'yellow', `Time: ${mins}:${secs}:${millis}`,
                     'red', `Difficulty: ${field.difficulty}`],
                    [{
                        type: 'button',
                        text: 'restart',
                        color: '#ffbf00',
                        subcolor: '#ea9700',
                        action: function() { window.location.reload(); }
                    }]
                );
                msgBox.style.display = '';
            } else if (table[x][y].data.value === 0) {
                redrawAdjusted(x, y, 'zero');
            } else {
                table[x][y].data.type = 'value';
                redrawAdjusted(x, y, 'octal');
            }
            if (mines === hidden) {
                for (const arr of table) {
                    for (const cell of arr) {
                        cell.elem.onclick = null;
                        cell.elem.oncontextmenu = null;
                    }
                }
                let time = Date.now() - field.time;
                let mins = Math.floor(time / 1000 / 60);
                let secs = Math.floor(time / 1000) - mins * 60;
                let millis = Math.floor((time - (mins * 60 + secs) * 1000) / 100);
                mins = (mins.toString().length == 1 ? '0' : '') + mins;
                secs = (secs.toString().length == 1 ? '0' : '') + secs;
                millis = (millis.toString().length == 1 ? '0' : '') + millis;
                msgBox.build(
                    ['lime', '🎉Win!🎉'],
                    ['lime', `Size: ${field.sizeX}x${field.sizeX}`,
                     'yellow', `Time: ${mins}:${secs}:${millis}`,
                     'red', `Difficulty: ${field.difficulty}`],
                    [{
                        type: 'button',
                        text: 'restart',
                        color: '#ffbf00',
                        subcolor: '#ea9700',
                        action: function() { window.location.reload(); }
                    }]
                );
                msgBox.style.display = '';
            }
        }
    }

    function clickR() {
        table[x][y].data.type = table[x][y].data.type == 'block' ? 'flag' : 'block';
        redrawAdjusted(x, y, 'octal');
        navigator.vibrate(50);
        return false;
    }
    
    elem.onclick = clickL;
    elem.oncontextmenu = clickR;

    return elem;
}

function redrawCell(x, y) {
    const val = table[x][y].data;
    val.center = val.type === 'block' || val.type === 'flag';
    for (let [a, b, i] of octangler(x, y)) {
        val[i] = (val.center && cellExists(a, b) && table[a][b].data.type === val.type);
    }
    if (table[x][y].elem && table[x][y].elem.parentNode) updateCell(table[x][y])
    else {
        let cell = createCell(x, y, val);
        field.appendChild(cell);
        table[x][y].elem = cell;
    }
}

function createDelimiterX(x, y) {
    let elem = document.createElement('div');
    elem.className = 'delimiter-horizontal';
    elem.style.setProperty('--x', x);
    elem.style.setProperty('--y', y);
    return elem;
}

function createDelimiterY(x, y) {
    let elem = document.createElement('div');
    elem.className = 'delimiter-vertical';
    elem.style.setProperty('--x', x);
    elem.style.setProperty('--y', y);
    return elem;
}

function createTable(x, y, chance) {
    let minefield = [];
    mines = 0;
    hidden = x * y;
    for (let i = 0; i < x; i++) {
        minefield.push([]);
        for (let j = 0; j < y; j++) {
            let mine = Math.random() > chance;
            if (mine) {
                minefield[i].push('val');
            } else {
                minefield[i].push('mine');
                mines++;
            }
        }
    }

    table = [];
    for (let i = 0; i < x; i++) {
        table.push([]);
        for (let j = 0; j < y; j++) {
            let data = {};
            if (minefield[i][j] === 'mine') data = {center: true, type: 'block', value: '☀'};
            else data = {center: true, type: 'block', value: (0 +
                (i != 0 && j != 0 && minefield[i-1][j-1] === 'mine') + 
                (j != 0 && minefield[i][j-1] === 'mine') +
                (i != x - 1 && j != 0 && minefield[i+1][j-1] === 'mine') +
                (i != x - 1 && minefield[i+1][j] === 'mine') +
                (i != x - 1 && j != y - 1 && minefield[i+1][j+1] === 'mine') +
                (j != y - 1 && minefield[i][j+1] === 'mine') +
                (i != 0 && j != y - 1 && minefield[i-1][j+1] === 'mine') +
                (i != 0 && minefield[i-1][j] === 'mine')
            )};
            table[i].push({data: data});
        }
    }
}

function redrawTable() {
    field.innerHTML = '';

    let delimeters = document.createElement('div');
    delimeters.id = 'delimeters';

    for (let x = 0; x < table.length; x++) {
        for (let y = 0; y < table[x].length; y++) {
            if (x != 0) {
                delimeters.append('\n    ');
                delimeters.appendChild(createDelimiterY(x, y));
            }
            if (y != 0) {
                delimeters.append('\n    ');
                delimeters.appendChild(createDelimiterX(x, y));
            }
        }
    }

    field.append('\n    ');
    field.appendChild(delimeters);

    for (let x = 0; x < table.length; x++) {
        for (let y = 0; y < table[x].length; y++) {
            field.append('\n    ');
            redrawCell(x, y);
        }
    }
}

function solve(x, y) { // 0 - value, 1 - mine, 2 - unsolved
    let tb = table;
    let ret = [];
    for (let x = 0; x < field.sizeX; x++) {
        ret.push([]);
        for (let y = 0; y < field.sizeY; y++) {
            ret.push(2);
        }
    }

    removeMine(x, y);
    for(let [a, b] of octangler(x, y)) {
        if (cellExists(a, b)) removeMine(a, b);
    }

    let re = table;
    table = tb;
    return re;
}

msgBox.build(
    ['white', 'Create Field:'],
    [], [{
        type: 'delimiter'
    },{
        type: 'label',
        text: 'Size:'
    },{
        type: 'number',
        value: 15,
        min: 3,
        max: 50
    },{
        type: 'label',
        text: 'x'
    },{
        type: 'number',
        value: 15,
        min: 3,
        max: 50
    },{
        type: 'delimiter'
    },{
        type: 'label',
        text: 'Difficulty:'
    },{
        type: 'number',
        value: 15,
        min: 0,
        max: 100
    },{
        type: 'delimiter'
    },{
        type: 'button',
        text: 'start',
        color: 'lime',
        subcolor: 'green',
        action: function() {
            let [x, y, diff] = msgBox.children.input.getElementsByClassName('number');
            field.sizeX = x.valueAsNumber;
            field.sizeY = y.valueAsNumber;
            field.difficulty = diff.valueAsNumber;
            field.time = Date.now();
            createTable(field.sizeX, field.sizeY, field.difficulty / 100);
            redrawTable();
            msgBox.style.display = 'none';
        }
    },{
        type: 'delimiter'
    }]
);