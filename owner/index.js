const {Pokemon} = require('../consumer.js');
const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');

const app = express();
const port = 3002;

// Configuración de Sequelize
const sequelize = new Sequelize('owner', 'postgres', '123456', {
    host: 'localhost',
    dialect: 'postgres',
  });

const Owner = sequelize.define('owner', {
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
      const pokemon = pokemonList[Math.floor(Math.random() * 5 + 1)]
      Owner.sync().then(() => {
        console.log('Tabla "owner" creada correctamente');
        Owner.create({
            id: pokemon.id,
            name: pokemon.name,
            base_experience: pokemon.base_experience,
            level: pokemon.level,
            types: pokemon.types,
            stats: pokemon.stats,
            image: pokemon.image
        });
        console.log('Valor guardado en la tabla "owner"');
        });
      res.status(200).json(pokemon);
    } catch (error) {
      console.error('Error al obtener los Pokémon:', error);
      res.status(500).json({ error: 'Error al obtener los Pokémon' });
    }
  });

  // Iniciar el servidor Express
app.listen(port, () => {
    console.log(`Servidor Express en funcionamiento en el puerto ${port}`);
  });