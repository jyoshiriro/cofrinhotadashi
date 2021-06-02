baseUrl = 'https://60b6deef17d1dc0017b886b3.mockapi.io';
user = '';

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
            balance = data[0].saldo;
            updateStatement();
        }

        b_balance.innerHTML = `$${balance.toFixed(2)}`;
    })
    .catch(function(error) {
        console.error('API Balance error', error);
        b_balance.innerHTML = "We'got a situation :(";
    });
}


function deposit() {
    doit("E");
}

function withdrawal() {
    doit("S");
}


function doit(type) {

    let cause = prompt('Why?', '');

    if (cause == null) {
        alert('Operation aborted! :(');
        return;
    }

    let body = {
        quando: new Date().toISOString(),
        quem: user,
        valor: type == "E" ? 0.50 : -1.00,
        tipo: type,
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

function updateBalance(value) {

    let balance = Number(b_balance.innerHTML.substring(1));
    let newBalance = balance + value;
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
            alert('Done :)');
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

        data.forEach(line => {
            let when = new Date(Date.parse(line.quando));
            let displayWhen = `${when.getDate().toString().padStart(2, '0')}/${(when.getMonth()+1).toString().padStart(2, '0')} - ${when.getHours().toString().padStart(2, '0')}:${when.getMinutes().toString().padStart(2, '0')}`
            let cause = line.motivo != "" ? `- ${line.motivo}` : ""

            let color = line.tipo == "E" ? 'blue' : 'maroon';

            div_statement.innerHTML += `<span style="color:${color}">${displayWhen} - <b>${line.quem}</b> ${cause}</span> <br>`;    
        });

        
    })
    .catch(function(error) {
        console.error('API Statement error', error);
        div_statement.innerHTML = "We'got a situation :(";
    });
}

function deleteOperation(id) {
    fetch(`${baseUrl}/operacoes/${id}`, {method: 'DELETE'})
    .then((resp) => console.log(`${id} deleted`))
    .catch(function(error) {
        console.error('API Delete Operation error', error);
    });
}
