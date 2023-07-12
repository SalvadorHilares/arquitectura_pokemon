const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');

const app = express();
const port = 3004;

app.use(express.json());

// Configuración de Sequelize
const sequelize = new Sequelize('result', 'postgres', '123456', {
    host: 'localhost',
    dialect: 'postgres',
  });

const Result = sequelize.define('result', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pokemonVictory: {
        type: DataTypes.STRING,
    },
    result: {
        type: DataTypes.STRING,
    }
});

app.post('/result', async (req, res) => {
    const {name}  = req.body;
    try {
      await Result.create({
        pokemonVictory: name,
        result: "WIN"
      });
      console.log("RESULT SAVED")
      res.status(200).json("Result saved");
    } catch (error) {
      console.error('Error al obtener los Pokémon:', error);
      res.status(500).json({ error: 'Error al obtener los Pokémon' });
    }
  });

// Sincronización del modelo con la base de datos
sequelize.sync()
  .then(() => {
    console.log('Modelo "RESULT" sincronizado con la base de datos');
    // Iniciar el servidor Express
    app.listen(port, () => {
      console.log(`Servidor Express en funcionamiento en el puerto ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar el modelo "RESULT":', error);
  });