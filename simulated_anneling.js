// Imports.
var fs = require('fs');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Diretório dos arquivos fornecidos.
const diretorio = './dadosTrab/';

// Caminho e distância atual
var cidades = [];
var distanciaAtual = 0;
// Melhor caminho e distância
var melhorCidades = [];
var melhorDistancia = 0;

// Temperatura e Fator de refrigeração.
var temperature = 1000;
var coolingFactor = 0.995;

// Quantidade de soluções por arquivo.
var quantidade;

// Coleta da quantidade de soluções por arquivo.
rl.question("Quantas execuções por arquivo?", (value) => {
    quantidade = value;
    iniciar();
    rl.close();
})

// Coleta de dados e execução do algoritmo.
function iniciar(){
    var dir = fs.readdirSync(diretorio).toString().split(",");

    dir.forEach((file)=>{
        var temp = fs.readFileSync(diretorio+file).toString().split(/[\n ]/g);
        var temp2 = removeTodasOcorencias(temp, '');
        cidades = criarCidades(temp2);
        cidades = shuffle(cidades);
        melhorCidades =  cidades;
        for(var i = 0; i < quantidade; i++){
            console.log("- Executando solução nº " + (i+1) + " do arquivo: " + file);
            SimulatedAnnealing ();
            var resultado = JSON.stringify(retornaCaminho(melhorCidades)) + " => " +  tamanhoRota(melhorDistancia, melhorCidades);
            console.log("- Executado")
            escreverArquivo(resultado, file);
        }
    });
    if(typeof quantidade === 'number' || quantidade > 0){
        console.log("Soluções estarão dentro da pasta: Solucoes_SimulatedAnnealing.");
    } else {
        console.log("Insira uma quantidade válida maior que 0.");
    }
}

// Execução do Simulated Annealing.
function SimulatedAnnealing(){
    for (var t = temperature; t > 1; t *= coolingFactor) {
        var vizinhanca = cidades;
        var vizinDist = distanciaAtual;

        var index1 = Math.floor(Math.random()*vizinhanca.length);
        var index2 = Math.floor(Math.random()*vizinhanca.length);

        var temp = vizinhanca[index1];
        vizinhanca[index1] = vizinhanca[index2];
        vizinhanca[index2] = temp;

        var distAtual = tamanhoRota(distanciaAtual, cidades);
        var distvizinhanca = tamanhoRota(vizinDist, vizinhanca);

        if (Math.random() < probabilidade(distAtual, distvizinhanca, t)){
            cidades = vizinhanca;
            distanciaAtual = vizinDist;
        }

        if(tamanhoRota(distanciaAtual, cidades) < tamanhoRota(melhorDistancia, melhorCidades)){
            melhorCidades = cidades;
            melhorDistancia = distanciaAtual;
        }
    }
}

// Cria as cidades. Ex: [i:'1', x:'100', y:'100'].
function criarCidades(arr){
    var temp = [];
    while(arr.length !== 0){
        temp.push({
            i: arr[0],
            x: arr[1],
            y: arr[2],
        });
        arr = arr.slice(3);
    }
    return temp;
}

// Formata a rota para ser exibida. Ex: [1 ,2 ,3 ,4 ,5].
function retornaCaminho(array){
    var log = [];
    for(var i = 0; i < array.length; i++){
        log.push(array[i].i);
    }
    return log;
}

// Calculo da rota.
function tamanhoRota(distancia, cidades) {
    if (distancia !== 0) return distancia;

    var distancia_total = 0;

    for (var i = 0; i < cidades.length ; i++) {
        var start = cidades[i];
        var end = cidades[i + 1 < cidades.length ? i + 1 : 0];
        distancia_total += distanciaFuncao(start, end);
    }

    return distancia_total;
}

// Calculo da distancia entre duas cidades.
function distanciaFuncao(cidade1, cidade2) {
    var xDist = Math.abs(cidade1.x - cidade2.x);
    var yDist = Math.abs(cidade1.y - cidade2.y);
    return Math.sqrt(xDist * xDist + yDist * yDist);
}

// Calculo da probabilidade.
function probabilidade(f1, f2, temp) {
    if (f2 < f1) return 1;
    return Math.exp((f1 - f2) / temp);
}

// Embaralhador.
function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Remove todas ocorrências de um determinado valor em uma array.
function removeTodasOcorencias(arr, value){
    arr.forEach((data, index)=>{
        if(data === value){
            arr.splice(index, 1);
        }
    })
    if(arr.indexOf('') !== -1){
        removeTodasOcorencias(arr, '')
    }
    return arr;
}

// Escreve as soluções dentro dos seus respectivos arquivos.
function escreverArquivo(data, nome){
    if(!fs.existsSync('./Solucoes_SimulatedAnnealing/')){
        fs.mkdirSync('./Solucoes_SimulatedAnnealing/');
    }
    fs.appendFileSync('./Solucoes_SimulatedAnnealing/'+nome, data.replace(/["]/g, '').replace(/[,]/g, ', ') + "\n");
}
