baseUrl = 'https://60b6deef17d1dc0017b886b3.mockapi.io';
user = '';

function init() {
    document.getElementById('in_password').focus();
    //document.getElementById('in_password').click();
}

function login() {
    let today = new Date()
    let day = today.getDate().toString().padStart(2, '0');
    let month = (today.getMonth()+1).toString().padStart(2, '0');
    let momsPassword = `${day}${month}`;
    let dadsPassword = `${month}${day}`;

    let isMom = in_password.value == momsPassword;
    let isDad = in_password.value == dadsPassword;
    
    if (isDad || isMom) {
        div_authentication.style.display = 'none';
        div_operations.style.display = '';
        loadBalance();
        user = isDad ? 'Dad Yoshi' : 'Mom Danusa';
        b_user.innerHTML = user;
    } else {
        div_password_error.style.display = '';
    }
}

function loadBalance() {
    b_balance.innerHTML = 'Loading...';

    fetch(`${baseUrl}/saldo`)
    .then((resp) => resp.json())
    .then(function(data) {
        let balance = 0;
        
        if (data.length > 0) {
            balance = Number(data[0].saldo);
            updateStatement();
        }

        updateBalanceIncreasing(balance);
    })
    .catch(function(error) {
        console.error('API Balance error', error);
        b_balance.innerHTML = "We'got a situation :(";
    });
}

let increasing = 0.238;
let maxIncreasingTimeMs = 3000;

function updateBalanceIncreasing(newBalance, tempPrior) {
    
    let interval = maxIncreasingTimeMs/((1/increasing)*newBalance);

    if (tempPrior == undefined) {
        tempPrior = 0;
        console.log('interval!', interval);
    }
    if (tempPrior < newBalance - increasing) {
        updateBalanceOnScreen(tempPrior, false);
        tempPrior += increasing;
        setTimeout(() => {
            updateBalanceIncreasing(newBalance, tempPrior)
        }, interval);
    } else {
        updateBalanceOnScreen(newBalance);
        img_tadashi.style.display = '';
        img_tadashi.src = (newBalance > 5) ? 'tadashi-money.png' : 'tadashi-nomoney.png';
    }
}

function updateBalanceOnScreen(newBalance, ignoreCents = true) {
    let onScreen;
    if (ignoreCents) {
        onScreen = Number(newBalance.toFixed(0)) == Number(newBalance.toFixed(2)) ? parseInt(newBalance) : newBalance.toFixed(2);
    } else {
        onScreen = newBalance.toFixed(2);
    }
    b_balance.innerHTML = `$${onScreen}`;
}


function deposit() {
    doit("E", 0.50);
}

function withdrawal() {
    doit("S", 1.0);
}

function buy() {
    let price = prompt('Price ?');

    if (price != null) {
        doit("B", Number(price));
    } 
}

function doit(type, value) {

    let isBuy = type == 'B';
    let isLess = isBuy || type == 'S';

    if (isLess) {
        if (value > getBalance()) {
            alert(`Insufficient balance! Operation aborted!`);
            return;
        }
    }

    let cause = prompt(isBuy ? 'What?' : 'Why?');

    if (cause == null) {
        return;
    }

    cause = isBuy ? `${cause} (R$${(value).toFixed(2)})` : cause;

    let body = {
        quando: new Date().toISOString(),
        quem: user,
        valor: isLess ? -(value) : value,
        tipo: isBuy ? 'S' : type,
        motivo: cause
    }

    let fetchData = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }

    fetch(`${baseUrl}/operacoes`, fetchData)
    .then((resp) => {
        if (resp.status == 201) {
            updateBalance(body.valor);
        }
    })
    .catch(function(error) {
        console.error('API Deposit error', error);
        b_balance.innerHTML = "We'got a situation :(";
    });
}

function getBalance() {
    return Number(b_balance.innerHTML.substring(1));
}

function updateBalance(value) {

    let newBalance = getBalance() + value;
    newBalance = newBalance < 0 ? 0 : newBalance;

    let fetchData = {
        method: 'PUT',
        body: JSON.stringify({ saldo: newBalance }),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }

    fetch(`${baseUrl}/saldo/1`, fetchData)
    .then((resp) => {
        if (resp.status == 200) {
            loadBalance();        
        }
    })
    .catch(function(error) {
        console.error('API Balance error', error);
        b_balance.innerHTML = "We'got a situation :(";
    });    
}

function updateStatement() {
    
    div_statement.innerHTML = `Loading...`;

    fetch(`${baseUrl}/operacoes`)
    .then((resp) => resp.json())
    .then(function(data) {

        if (data.length > 50) {
            for (i = 0; i < data.length - 50; i++) {
                deleteOperation(data[i].id);
                data.shift();
            }
        }

        div_statement.innerHTML = ``;

        data.reverse();

        let linesCounter = 0;
        data.forEach(line => {
            let when = new Date(Date.parse(line.quando));
            let displayWhen = `${when.getDate().toString().padStart(2, '0')}/${(when.getMonth()+1).toString().padStart(2, '0')} - ${when.getHours().toString().padStart(2, '0')}:${when.getMinutes().toString().padStart(2, '0')}`
            let cause = line.motivo != "" ? `- ${line.motivo}` : ""

            let color = line.tipo == "E" ? 'blue' : 'maroon';
            
            let operationScreen = `${displayWhen} - <b>${line.quem}</b> ${cause}`;
            
            let operationPrompt = `${displayWhen} - ${line.quem} ${cause}`;
            let deleteLink = ++linesCounter <= 5 
                    ? `<a href="javascript:;" onclick="promptDelete('${operationPrompt}', ${line.id}, ${line.valor})">[X]</a>` 
                    : '';

            div_statement.innerHTML += `
                <span id="s_op${line.id}" style="color:${color}">
                    ${operationScreen} ${deleteLink}                    
                </span> <br>  <br>`;    
        });

        
    })
    .catch(function(error) {
        console.error('API Statement error', error);
        div_statement.innerHTML = "We'got a situation :(";
    });
}

function promptDelete(operation, id, type, value) {
    if (confirm(`Undo the operation "${operation}"?`)) {
        deleteOperation(id, type, value);
    }
}

function deleteOperation(id, value) {
    fetch(`${baseUrl}/operacoes/${id}`, {method: 'DELETE'})
    .then((resp) =>  {
        console.log(`${id} deleted`);
        if (value == undefined) {
            loadBalance();
        } else {
            updateBalance(-(value));
        }
    })
    .catch(function(error) {
        console.error('API Delete Operation error', error);
    });
}
