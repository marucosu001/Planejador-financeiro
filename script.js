const formulario = document.getElementById("formPrincipal");
const entradaDeValor = document.getElementById("entradaValor");
const tipoEntrada = document.getElementById("tipoEntrada");
const categoriaEntrada = document.getElementById("inputCategoriaEntrada");
const dataEntrada = document.getElementById("dataEntrada");
const tabelaFinanceira = document.querySelector(".tabelaFinanceira");
const footTabela = document.getElementById("footTabela");
let idEmEdicao = null;

//>>>>>>>>> localStorage <<<<<<<<<<<<<<//

function salvarNoLocalStorage(){
    localStorage.setItem("arrayDeValores", JSON.stringify(arrayDeValores));
}

function carregarDoLocalStorage(){
    const dados = localStorage.getItem("arrayDeValores");
    try {
        arrayDeValores = dados ? JSON.parse(dados) : [];
    } catch {
        arrayDeValores = [];
    }
}

//>>>>>>>>> MENSAGEM DE ERRO <<<<<<<<<<//

const mensagemErro = document.getElementById("mensagemErro");

function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.classList.remove("escondido");

    setTimeout(() => {
        mensagemErro.classList.add("escondido");
    }, 3000);
}

// Formatação em BRL

const formatarBRL = (valor) =>
    new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(valor);

// IDs dos <p> do resumo geral

const pReceita = document.getElementById("receita");
const pDespesa = document.getElementById("despesa");
const pSaldo = document.getElementById("saldo");

// IDs do elementos relacionados a criação da tabela

const corpoTabela = document.getElementById("corpoTabela");
const cabecalhoTabela = document.getElementById("cabecalho");


let arrayDeValores = [];

////////////// feature de criar os filtros///////////////////////

const selectTipo = document.getElementById("filtroTipo");
const selectCategoria = document.getElementById("filtroCategoria");

function filtroCategoria(){

    const valorAtual = selectCategoria.value;

    const categoriasUnicas = new Set(arrayDeValores.map(c => c.categoria));
    
    const arrayCategoriasfiltradas = [...categoriasUnicas];

    selectCategoria.textContent = "";

    let opcaoTodas = document.createElement("option");
    opcaoTodas.textContent = "Todas";
    opcaoTodas.value = "todas"

    selectCategoria.appendChild(opcaoTodas);

    for(const categoria of arrayCategoriasfiltradas) {

        let option = document.createElement("option");
        option.textContent = categoria;
        option.value = categoria;

        selectCategoria.appendChild(option);
    }

    const categoriaAindaExiste = [...selectCategoria.options].some(opt => opt.value === valorAtual);
    if(categoriaAindaExiste){
        selectCategoria.value = valorAtual;
    }
}

function atualizarInterface(){
    atualizarTabela();
    filtroCategoria();
    renderizarResumo();
}


function obterArrayFiltrado(){

    const filtroAtual = selectTipo.value;
    const filtroCategoriaEstado = selectCategoria.value;

    let dadosPraMostrar = arrayDeValores;

    if(filtroAtual !== "filtroTodasOfTipo"){
        dadosPraMostrar = arrayDeValores.filter(elemento => elemento.tipo === filtroAtual);
    }

    if(filtroCategoriaEstado !== "todas"){
        dadosPraMostrar = dadosPraMostrar.filter(elemento => elemento.categoria === filtroCategoriaEstado);
    }
    
    return dadosPraMostrar;
}

function atualizarTabela(){
    const arrayFiltrado = obterArrayFiltrado();

    renderizarTabela(arrayFiltrado);
}


selectTipo.addEventListener("change", function(){

    atualizarTabela();
})

selectCategoria.addEventListener("change", function(){

    atualizarTabela()
})


function validarDados(){

    const valor = parseFloat(entradaDeValor.value);
    const tipo = tipoEntrada.value;
    const categoria = categoriaEntrada.value;
    const data = dataEntrada.value;

    if (valor <= 0 || !tipo || !categoria || !data) {
        mostrarErro("Por favor, preencha todos os campos")
        return false;
    }

    return true;
}

function salvarDadosArray(){
    const valor = parseFloat(entradaDeValor.value);
    const tipo = tipoEntrada.value;
    const categoria = categoriaEntrada.value;
    const data = dataEntrada.value;


    arrayDeValores.push({
        id : crypto.randomUUID(),
        valor : valor,
        tipo : tipo,
        categoria : categoria.trim(),
        data : data
    });
}

function resumoGeral(array){

    const totalReceitas = array
    .filter(t => t.tipo === "receita")
    .reduce((contador, t) => contador + t.valor, 0);

    const totalDespesas = array
    .filter(t => t.tipo === "despesa")
    .reduce((contador, t) => contador + t.valor, 0);

    return {
        totalReceitas,
        totalDespesas,
        total : totalReceitas - totalDespesas
    }
}

//>>>>>>>>>>>Calculo de total na tabela<<<<<<<<//

function totalCalculado() {
    const arrayDeCalculo = obterArrayFiltrado();

    
    const total = arrayDeCalculo.reduce((soma, item) => {

        if(item.tipo === "receita"){return soma + Number(item.valor);}

        if(item.tipo === "despesa"){return soma - Number(item.valor);}

        return soma;
    }, 0);


    return total;
    
}

function renderizarTabela(dados){


    corpoTabela.innerHTML = "";

    

    for (const {id, valor, tipo, categoria, data} of dados) {
    
        let linhaTabela = document.createElement("tr");

        // dataset para criar verificador único por id em cada linha da tabela

        linhaTabela.dataset.id = id;
        

        let celValor = document.createElement("td");
        let celTipo = document.createElement("td");
        let celCategoria = document.createElement("td");
        let celData = document.createElement("td");

        // Botão de excluir
        let celExcluir = document.createElement("td");
        let botaoExcluir = document.createElement("button");
        botaoExcluir.classList.add("botaoExcluir");
        celExcluir.appendChild(botaoExcluir);
        botaoExcluir.textContent = "X";

       // Botão de editar
        let celEditar = document.createElement("td");
        let botaoEditar = document.createElement("button");
        botaoEditar.classList.add("botaoEditavel")
        botaoEditar.textContent = "Editar";
        celEditar.appendChild(botaoEditar);

        

        celValor.textContent =`${formatarBRL(valor)}`;
        celTipo.textContent = capitalizar(tipo);
        celCategoria.textContent =`${categoria}`;
        celData.textContent = new Date(data).toLocaleDateString("pt-BR");



        linhaTabela.append(celValor, celTipo, celCategoria, celData, celExcluir, celEditar,);
        corpoTabela.appendChild(linhaTabela);

        
    }

    // foot do total da tabela
        criarFootTabela();
}

function criarFootTabela() {
    footTabela.innerHTML = "";

    let total = totalCalculado();
    
     
    footTabela.textContent = formatarBRL(total);
}


function excluirLinhaTabela(corpoTabela){

    corpoTabela.addEventListener("click", function(event){

        if(event.target.classList.contains("botaoExcluir")) {

            const confirmar = confirm("Tem certeza que deseja excluir esse laçamento?")
            if(!confirmar) return;
            
            const linha = event.target.closest("tr");
            const id = linha.dataset.id;

            if(id === idEmEdicao){
                idEmEdicao = null;
            }

            arrayDeValores = arrayDeValores.filter(item => item.id !== id);
            salvarNoLocalStorage();
            
            atualizarInterface();
        }
    })

}

function editarLinhaTabela(){
    corpoTabela.addEventListener("click", function(event){

        if(event.target.classList.contains("botaoEditavel")){

            if(idEmEdicao !== null){
                mostrarErro("Por favor, termine a edição primeiro");
                return;
            }

            const linha = event.target.closest("tr");
            const id = linha.dataset.id;
            

            editandoTabela(id, linha);
        }
    })
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function editandoTabela(id, linha){

    idEmEdicao = id;

    let objDeEdicao = arrayDeValores.find(item => item.id === id);
    const celulas = linha.cells;


    //input do valor

    let inputValor = document.createElement("input");
    inputValor.type = "number";
    inputValor.value = objDeEdicao.valor;
    inputValor.step = 0.01;

    celulas[0].innerHTML = "";
    celulas[0].appendChild(inputValor);


    // select do tipo

    let selectTipoEdicao = document.createElement("select");
    
    let optionReceita = document.createElement("option");
    optionReceita.value = "receita";
    optionReceita.textContent = "Receita";

    let optionDespesa = document.createElement("option");
    optionDespesa.value = "despesa";
    optionDespesa.textContent = "Despesa";

    selectTipoEdicao.append(optionReceita, optionDespesa);
    selectTipoEdicao.value = objDeEdicao.tipo;

    celulas[1].innerHTML = "";
    linha.cells[1].appendChild(selectTipoEdicao);


    // input da categoria

    let inputCategoria = document.createElement("input");
    inputCategoria.type = "text";
    inputCategoria.value = objDeEdicao.categoria;

    celulas[2].innerHTML = "";
    linha.cells[2].append(inputCategoria);


    // seletor de data

    let inputData = document.createElement("input");
    inputData.type = "date";
    inputData.value = objDeEdicao.data;

    celulas[3].innerHTML = "";
    linha.cells[3].append(inputData);



    //>>>>>>>>>> Lógica de salvar e cancelar as alteraões <<<<<<<<<<<//

    celulas[5].innerHTML = "";
    const botaoSalvar = document.createElement("button");
    botaoSalvar.classList.add("botaoSalvar");
    botaoSalvar.textContent = "Salvar";

    const botaoCancelarEdicao = document.createElement("button");
    botaoCancelarEdicao.classList.add("botaoCancelarEdicao");
    botaoCancelarEdicao.textContent = "Cancelar";
    
    celulas[5].append(botaoSalvar, botaoCancelarEdicao);
}

function salvarEdicao() {
    corpoTabela.addEventListener("click", function(event){

            if(event.target.classList.contains("botaoSalvar")){
                const linha = event.target.closest("tr");
                const id = linha.dataset.id;

                let objDeEdicao = arrayDeValores.find(item => item.id === id)

                const inputs = linha.querySelectorAll("input, select");

                let valorInNumber = Number(inputs[0].value);

                if(valorInNumber <= 0 || !(inputs[1].value) || !inputs[2].value.trim() || !inputs[3].value){
                    mostrarErro("preencha todos os campos");
                    return;
                }

                objDeEdicao.valor = valorInNumber;
                objDeEdicao.tipo = inputs[1].value;
                objDeEdicao.categoria = inputs[2].value;
                objDeEdicao.data = inputs [3].value;

                salvarNoLocalStorage();
                atualizarInterface();

                idEmEdicao = null;
                
        }
    })
}

function cancelarEdicao(){

    corpoTabela.addEventListener("click", function(event){

         if(event.target.classList.contains("botaoCancelarEdicao")) {
            idEmEdicao = null;
            atualizarInterface();
         }
    })
}

function renderizarResumo(){
    const {totalReceitas, totalDespesas, total} = resumoGeral(arrayDeValores);

    pReceita.textContent = formatarBRL(totalReceitas);
    pDespesa.textContent = formatarBRL(totalDespesas);
    pSaldo.textContent = formatarBRL(total);


}

function navegarCampos(){
    const campos = [entradaDeValor, tipoEntrada, dataEntrada, categoriaEntrada];

    campos.forEach((campo, index) => {
        campo.addEventListener("keydown", function(event){
            if(event.key === "Enter"){
                event.preventDefault();
                const proximo = campos[index + 1];
                if(proximo){
                    proximo.focus();
                } else {
                    formulario.requestSubmit();
                }
            }
        })
    })
}



formulario.addEventListener("submit", function(event){

    event.preventDefault();
    

    if(!validarDados()) return;

    salvarDadosArray();
    salvarNoLocalStorage();

    atualizarInterface();

    formulario.reset();

    entradaDeValor.focus();
})

carregarDoLocalStorage();
atualizarInterface();

navegarCampos();
excluirLinhaTabela(corpoTabela);
editarLinhaTabela();
salvarEdicao();
cancelarEdicao();