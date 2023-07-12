const express = require('express');
const axios = require('axios');
const kafka = require('kafka-node');

// Configuración de Kafka
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });

// Crear un productor de Kafka una vez que el servidor esté listo
const producer = new kafka.Producer(client);

// Configuración de Express
const app = express();
const port = 3000;

// Ruta para manejar las solicitudes
app.get('/pokemon', async (req, res) => {
  const { id } = req.query;

  const query = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const api_pokemon = await query.data;

  const level = Math.floor(Math.random() * (30 - 1) + 1)

  const payloads = [
    {
      topic: 'pokemon',
      messages: JSON.stringify({
        id: api_pokemon.id,
        name: api_pokemon.name,
        base_experience: api_pokemon.base_experience,
        level : level,
        types: api_pokemon.types.map(type => type.type.name),
        stats: api_pokemon.stats.map(stat => {
            return {
                name: stat.stat.name,
                base: stat.base_stat
            }
        }
        ),
        image: api_pokemon.sprites.other['official-artwork'].front_default
     }),
    },
  ];

  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error al enviar mensaje:', err);
      res.status(500).json({ error: 'Error al enviar mensaje' });
    } else {
      console.log('Mensaje enviado:', data);
      res.status(200).json({ message: 'Mensaje enviado a Kafka' });
    }
  });
});

// Iniciar el servidor Express
const server = app.listen(port, () => {
  console.log(`Servidor Express en funcionamiento en el puerto ${port}`);

  producer.on('ready', () => {
    console.log('Productor de Kafka listo');
  });

  producer.on('error', (err) => {
    console.error('Error en el productor:', err);
  });
});

// Manejo de cierre del servidor y el productor
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Servidor Express cerrado');
    producer.close(() => {
      console.log('Productor de Kafka cerrado');
      process.exit(0);
    });
  });
});
