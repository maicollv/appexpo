import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import { db, addDoc, collection } from './firebase';

const cartas = [
  { id: 1, imagen: require('./assets/manzana.jpeg'), emparejado: false },
  { id: 2, imagen: require('./assets/manzana.jpeg'), emparejado: false },
  { id: 3, imagen: require('./assets/banana.jpeg'), emparejado: false },
  { id: 4, imagen: require('./assets/banana.jpeg'), emparejado: false },
  { id: 5, imagen: require('./assets/cereza.jpeg'), emparejado: false },
  { id: 6, imagen: require('./assets/cereza.jpeg'), emparejado: false },
  { id: 7, imagen: require('./assets/uva.jpeg'), emparejado: false },
  { id: 8, imagen: require('./assets/uva.jpeg'), emparejado: false },
  { id: 9, imagen: require('./assets/fresa.jpeg'), emparejado: false },
  { id: 10, imagen: require('./assets/fresa.jpeg'), emparejado: false },
  { id: 11, imagen: require('./assets/naranja.jpeg'), emparejado: false },
  { id: 12, imagen: require('./assets/naranja.jpeg'), emparejado: false },
];

const App = () => {
  const [nombres, setNombres] = useState('');
  const [cartasJuego, setCartasJuego] = useState([]);
  const [cartasVolteadas, setCartasVolteadas] = useState([]);
  const [tiempo, setTiempo] = useState(0);
  const [jugando, setJugando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [parejasEncontradas, setParejasEncontradas] = useState(0);

  useEffect(() => {
    if (jugando) {
      const timer = setInterval(() => setTiempo((prev) => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [jugando]);

  const iniciarJuego = () => {
    if (!nombres.trim()) {
      setMensaje('Por favor ingrese un nombre.');
      return;
    }

    setMensaje('');
    setParejasEncontradas(0);
    setTiempo(0);
    setCartasVolteadas([]);
    setJugando(true);

    const cartasDesordenadas = [...cartas].sort(() => Math.random() - 0.5);
    setCartasJuego(cartasDesordenadas);
  };

  const manejarClick = (carta) => {
    if (carta.emparejado || cartasVolteadas.length === 2) return;

    setCartasVolteadas((prev) => [...prev, carta]);

    if (cartasVolteadas.length === 1) {
      const carta1 = cartasVolteadas[0];
      const carta2 = carta;

      if (carta1.imagen === carta2.imagen) {
        setParejasEncontradas(parejasEncontradas + 1);
        setCartasJuego((prevCartas) =>
          prevCartas.map((c) => (c.imagen === carta1.imagen ? { ...c, emparejado: true } : c))
        );
      }

      setTimeout(() => setCartasVolteadas([]), 1000);
    }
  };

  useEffect(() => {
    if (parejasEncontradas === cartas.length / 2) {
      setJugando(false);
      setMensaje(`¡Juego Terminado! Tu tiempo fue: ${tiempo} segundos.`);
      guardarResultado();
    }
  }, [parejasEncontradas, tiempo]);

  const guardarResultado = async () => {
    try {
      await addDoc(collection(db, 'resultados'), {
        nombre: nombres,
        tiempo: tiempo,
        fecha: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error al guardar el resultado: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Juego de Memoria con Frutas</Text>
      {!jugando && (
        <View>
          <Text>Ingrese su nombre:</Text>
          <TextInput style={styles.input} value={nombres} onChangeText={setNombres} placeholder="Ejemplo: Juan" />
          <TouchableOpacity style={styles.button} onPress={iniciarJuego}>
            <Text style={styles.buttonText}>Iniciar Juego</Text>
          </TouchableOpacity>
        </View>
      )}
      {mensaje && <Text style={styles.message}>{mensaje}</Text>}
      {jugando && (
        <View>
          <Text style={styles.timer}>Tiempo: {tiempo} segundos</Text>
          <FlatList
            data={cartasJuego}
            numColumns={4}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => manejarClick(item)}
                disabled={item.emparejado || cartasVolteadas.includes(item)}
              >
                {cartasVolteadas.includes(item) || item.emparejado ? (
                  <Image source={item.imagen} style={styles.image} />
                ) : (
                  <Text style={styles.cardText}>?</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, width: 200, marginBottom: 10, textAlign: 'center' },
  button: { backgroundColor: 'blue', padding: 10, borderRadius: 5 },
  buttonText: { color: 'white', fontSize: 16 },
  message: { marginTop: 10, fontSize: 16 },
  timer: { fontSize: 18, marginBottom: 10 },
  card: { width: 70, height: 70, alignItems: 'center', justifyContent: 'center', margin: 5, backgroundColor: 'gray' },
  cardText: { fontSize: 30, color: 'white' },
  image: { width: 60, height: 60 },
});

export default App;