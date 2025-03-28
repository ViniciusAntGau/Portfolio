let mapa;
let marcadores = [];
let rotaControl; // Controlador da rota
let coordenadasUsuario; // Armazena as coordenadas do usuário
let revendedoraMaisProxima; // Armazena a revendedora mais próxima

document.getElementById('cepForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const cep = document.getElementById('cep').value.replace(/\D/g, ''); // Remove caracteres não numéricos
    const endereco = await buscarEnderecoPorCEP(cep);
    if (endereco) {
        coordenadasUsuario = await buscarCoordenadasPorEndereco(endereco);
        if (coordenadasUsuario) {
            await buscarRevendedora(coordenadasUsuario);
            document.getElementById('definirRota').disabled = false; // Habilita o botão "Definir Rota"
        } else {
            document.getElementById('resultado').innerHTML = `<p>Não foi possível encontrar as coordenadas para o CEP informado.</p>`;
        }
    } else {
        document.getElementById('resultado').innerHTML = `<p>CEP não encontrado. Tente novamente.</p>`;
    }
});

document.getElementById('definirRota').addEventListener('click', function() {
    if (coordenadasUsuario && revendedoraMaisProxima) {
        definirRotaNoMapa(coordenadasUsuario, revendedoraMaisProxima);
    }
});

function inicializarMapa() {
    // Coordenadas iniciais do mapa (centro do Brasil)
    mapa = L.map('map').setView([-15.7801, -47.9292], 4);

    // Adiciona o mapa base do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);
}

async function buscarRevendedora(coordenadasUsuario) {
    const usuarioLat = coordenadasUsuario.lat;
    const usuarioLon = coordenadasUsuario.lon;

    const revendedoras = [
        { nome: "Revendedora 1 - São Paulo", endereco: "Avenida Paulista, 1000", lat: -23.5635, lon: -46.6523 },
        { nome: "Revendedora 2 - Florianópolis", endereco: "Rua da Praia, 150", lat: -27.5945, lon: -48.5477 }
    ];

    let menorDistancia = Infinity;

    revendedoras.forEach(revendedora => {
        const distancia = calcularDistancia(usuarioLat, usuarioLon, revendedora.lat, revendedora.lon);
        if (distancia < menorDistancia) {
            menorDistancia = distancia;
            revendedoraMaisProxima = revendedora;
        }
    });

    if (revendedoraMaisProxima) {
        document.getElementById('resultado').innerHTML = `
            <p>A revendedora mais próxima é: <strong>${revendedoraMaisProxima.nome}</strong></p>
            <p>Endereço: ${revendedoraMaisProxima.endereco}</p>
        `;

        // Limpar marcadores antigos
        marcadores.forEach(marcador => mapa.removeLayer(marcador));
        marcadores = [];

        // Adicionar marcador do usuário (nova imagem)
        const marcadorUsuario = L.marker([usuarioLat, usuarioLon], {
            title: "Sua Localização",
            icon: L.icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png', // Nova imagem do usuário
                iconSize: [32, 32], // Tamanho do ícone
                iconAnchor: [16, 32], // Ponto de ancoragem do ícone
                popupAnchor: [0, -32] // Ajuste para o popup (se necessário)
            })
        }).addTo(mapa);
        marcadores.push(marcadorUsuario);

        // Adicionar marcador da revendedora mais próxima (ícone personalizado maior)
        const marcadorRevendedora = L.marker([revendedoraMaisProxima.lat, revendedoraMaisProxima.lon], {
            title: revendedoraMaisProxima.nome,
            icon: L.icon({
                iconUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUL3yy5nvJ1oWdTz6wx67chO8s8pelEe7YdA&s', // Ícone personalizado da revendedora
                iconSize: [48, 48], // Tamanho do ícone aumentado
                iconAnchor: [24, 48] // Ponto de ancoragem ajustado
            })
        }).addTo(mapa);
        marcadores.push(marcadorRevendedora);

        // Centralizar o mapa na área entre o usuário e a revendedora
        const bounds = L.latLngBounds([
            [usuarioLat, usuarioLon],
            [revendedoraMaisProxima.lat, revendedoraMaisProxima.lon]
        ]);
        mapa.fitBounds(bounds);
    } else {
        document.getElementById('resultado').innerHTML = `<p>Nenhuma revendedora encontrada.</p>`;
    }
}

function definirRotaNoMapa(origem, destino) {
    // Remove a rota anterior, se existir
    if (rotaControl) {
        mapa.removeControl(rotaControl);
    }

    // Cria a rota entre o usuário e a revendedora
    rotaControl = L.Routing.control({
        waypoints: [
            L.latLng(origem.lat, origem.lon), // Ponto de origem (usuário)
            L.latLng(destino.lat, destino.lon) // Ponto de destino (revendedora)
        ],
        routeWhileDragging: true, // Atualiza a rota em tempo real ao arrastar os pontos
        show: true, // Exibe a rota no mapa
        addWaypoints: false, // Impede a adição de novos pontos
        draggableWaypoints: false, // Impede a movimentação dos pontos
        fitSelectedRoutes: true, // Centraliza o mapa na rota
        createMarker: function(i, waypoint, n) {
            // Personaliza o marcador do ponto de partida (usuário)
            if (i === 0) {
                return L.marker(waypoint.latLng, {
                    icon: L.icon({
                        iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png', // Nova imagem do usuário
                        iconSize: [32, 32], // Tamanho do ícone
                        iconAnchor: [16, 32], // Ponto de ancoragem do ícone
                        popupAnchor: [0, -32] // Ajuste para o popup (se necessário)
                    })
                });
            }
            // Personaliza o marcador do ponto de destino (revendedora)
            return L.marker(waypoint.latLng, {
                icon: L.icon({
                    iconUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUL3yy5nvJ1oWdTz6wx67chO8s8pelEe7YdA&s', // Ícone personalizado da revendedora
                    iconSize: [48, 48], // Tamanho do ícone aumentado
                    iconAnchor: [24, 48] // Ponto de ancoragem ajustado
                })
            });
        }
    }).addTo(mapa);
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function buscarEnderecoPorCEP(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
            return null;
        }
        // Monta o endereço completo
        return `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`;
    } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        return null;
    }
}

async function buscarCoordenadasPorEndereco(endereco) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`);
        const data = await response.json();
        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erro ao buscar coordenadas:", error);
        return null;
    }
}

// Inicializa o mapa ao carregar a página
inicializarMapa();