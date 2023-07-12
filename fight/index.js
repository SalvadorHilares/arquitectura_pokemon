const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const axios = require('axios');

const app = express();
const port = 3003;

// Configuración de Sequelize
const sequelize = new Sequelize('fight', 'postgres', '123456', {
    host: 'localhost',
    dialect: 'postgres',
  });

const Fight = sequelize.define('fight', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    state_pokemon: {
        type: DataTypes.STRING,
    },
    health_pokemon: {
        type: DataTypes.INTEGER,
    }
});

app.use(express.json());

const RESULT_SERVICE_URL = 'http://localhost:3004/result'; // URL del microservicio FIGHT

// Función para enviar la información del Pokémon al microservicio FIGHT
const sendToResultService = async (pokemonInfo) => {
  try {
    const response = await axios.post(RESULT_SERVICE_URL, pokemonInfo);
    console.log('Respuesta del microservicio RESULT:', response.data);
  } catch (error) {
    console.error('Error al enviar los datos al microservicio RESULT:', error);
  }
};

app.post('/fight', async (req, res) => {
    try {
      const {pokemonSavage, pokemonUser}  = req.body;
      let winnerPokemon = null;
      if(pokemonSavage.level >= pokemonUser.level){
        winnerPokemon = pokemonSavage;
      }else{
        winnerPokemon = pokemonUser;
      }
      await Fight.create({
        state_pokemon: "NORMAL",
        health_pokemon: winnerPokemon.stats[0].base,
      });
      const name = winnerPokemon.name;
      sendToResultService(name)
      console.log("FIGHT SAVED")
      res.status(200).json("Winner: " + winnerPokemon.name);
    } catch (error) {
      console.error('Error al obtener los Pokémon:', error);
      res.status(500).json({ error: 'Error al obtener los Pokémon' });
    }
  });

// Sincronización del modelo con la base de datos
sequelize.sync()
  .then(() => {
    console.log('Modelo "FIGHT" sincronizado con la base de datos');
    // Iniciar el servidor Express
    app.listen(port, () => {
      console.log(`Servidor Express en funcionamiento en el puerto ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar el modelo "FIGHT":', error);
  });
