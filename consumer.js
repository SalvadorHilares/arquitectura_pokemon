const kafka = require('kafka-node');
const { Sequelize, DataTypes } = require('sequelize');

// Configuración de Kafka
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new kafka.Consumer(
  client,
  [{ topic: 'pokemon' }], // Tópicos a consumir
  { groupId: 'savage-pokemon' } // Grupo de consumidores
);

// Configuración de Sequelize
const sequelize = new Sequelize('savage_pokemon', 'postgres', '123456', {
  host: 'localhost',
  dialect: 'postgres',
});

// Definición del modelo "Pokemon"
const Pokemon = sequelize.define('pokemon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  base_experience: {
    type: DataTypes.INTEGER,
  },
  level: {
    type: DataTypes.INTEGER,
  },
  types: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
  stats: {
    type: DataTypes.ARRAY(DataTypes.JSON),
  },
  image: {
    type: DataTypes.STRING,
  }
});

// Sincronización del modelo con la base de datos
Pokemon.sync()
  .then(() => {
    console.log('Tabla "pokemon" creada correctamente');

    // Manejo de eventos del consumidor
    consumer.on('message', async function (message) {
    const pokemon = JSON.parse(message.value);

      try {
        // Guardar el valor en la tabla "pokemon"
        await Pokemon.create({
            id: pokemon.id,
            name: pokemon.name,
            base_experience: pokemon.base_experience,
            level: pokemon.level,
            types: pokemon.types,
            stats: pokemon.stats,
            image: pokemon.image
        });

        console.log('Valor guardado en la tabla "pokemon"');
      } catch (error) {
        console.error('Error al guardar el valor en la tabla "pokemon":', error);
      }
    });

    consumer.on('error', function (err) {
      console.error('Error en el consumidor:', err);
    });

    consumer.on('offsetOutOfRange', function (topic) {
      console.error('Offset fuera de rango:', topic);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar el modelo con la base de datos:', error);
  });