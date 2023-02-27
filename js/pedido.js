const pedido = (url, callback) => {
    fetch(url)
        .then((respuesta) => respuesta.json())
        .then((json) => callback(json));
}