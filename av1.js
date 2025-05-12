// Armazenamento e manipulação de dados
class Storage {
    static dbName = "academicoDB";
    static storeName = "disciplinas";

    static async openDb() {
        const request = indexedDB.open(Storage.dbName, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(Storage.storeName)) {
                db.createObjectStore(Storage.storeName, { autoIncrement: true });
            }
        };

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("Erro ao abrir o banco de dados.");
        });
    }

    static async addDisciplina(disciplina) {
        const db = await Storage.openDb();
        const transaction = db.transaction(Storage.storeName, "readwrite");
        const store = transaction.objectStore(Storage.storeName);
        const request = store.add(disciplina);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("Erro ao adicionar disciplina.");
        });
    }

    static async getDisciplinas() {
        const db = await Storage.openDb();
        const transaction = db.transaction(Storage.storeName, "readonly");
        const store = transaction.objectStore(Storage.storeName);
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("Erro ao buscar disciplinas.");
        });
    }

    static async deleteDisciplina(id) {
        const db = await Storage.openDb();
        const transaction = db.transaction(Storage.storeName, "readwrite");
        const store = transaction.objectStore(Storage.storeName);
        const request = store.delete(id);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("Erro ao excluir disciplina.");
        });
    }
}

// Função de autenticação
function authenticateUser(username, password) {
    // Usamos um armazenamento simples com o localStorage para armazenar credenciais fictícias
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');

    if (username === storedUsername && password === storedPassword) {
        return true;
    }
    return false;
}

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const isAuthenticated = authenticateUser(username, password);

    if (isAuthenticated) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('formulario').style.display = 'block';
        document.getElementById('resultados').style.display = 'block';
    } else {
        document.getElementById('login-error').textContent = 'Usuário ou senha inválidos.';
    }
});

// Função para calcular média ponderada
function calcularMedia(disciplinas) {
    let totalNota = 0;
    let totalPeso = 0;
    disciplinas.forEach(disciplina => {
        totalNota += disciplina.nota * disciplina.peso;
        totalPeso += disciplina.peso;
    });
    return (totalNota / totalPeso).toFixed(2);
}

// Função para atualizar a tabela e exibir dados
async function atualizarTabela() {
    const disciplinas = await Storage.getDisciplinas();
    const tbody = document.querySelector("#tabela-notas tbody");
    tbody.innerHTML = "";

    disciplinas.forEach(disciplina => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="checkbox" data-id="${disciplina.id}"></td>
            <td>${disciplina.nome}</td>
            <td>${disciplina.nota}</td>
            <td>${disciplina.peso}</td>
            <td>
                <button class="btn-editar" onclick="editarDisciplina(${disciplina.id})">Editar</button>
                <button class="btn-excluir" onclick="excluirDisciplina(${disciplina.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    calcularEExibirMedia();
}

// Função para excluir em massa
document.getElementById('excluir-massa').addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('.checkbox:checked');
    for (const checkbox of checkboxes) {
        const id = parseInt(checkbox.getAttribute('data-id'));
        await Storage.deleteDisciplina(id);
    }
    atualizarTabela();
});

// Excluir disciplina
async function excluirDisciplina(id) {
    await Storage.deleteDisciplina(id);
    atualizarTabela();
}

// Editar disciplina
async function editarDisciplina(id) {
    alert("Edição de disciplinas ainda em desenvolvimento!");
}
