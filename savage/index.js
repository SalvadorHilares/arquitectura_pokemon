const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3001;

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

// Ruta para obtener los últimos 5 Pokémon agregados
app.get('/pokemon', async (req, res) => {
  try {
    const pokemonList = await Pokemon.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
    });
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    const randomPokemon = pokemonList[randomIndex];
    res.status(200).json(randomPokemon);
  } catch (error) {
    console.error('Error al obtener los Pokémon:', error);
    res.status(500).json({ error: 'Error al obtener los Pokémon' });
  }
});

// Sincronización del modelo con la base de datos
sequelize.sync()
  .then(() => {
    console.log('Modelo "Pokemon" sincronizado con la base de datos');
    // Iniciar el servidor Express
    app.listen(port, () => {
      console.log(`Servidor Express en funcionamiento en el puerto ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar el modelo "Pokemon":', error);
  });
