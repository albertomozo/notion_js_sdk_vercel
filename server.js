const express = require('express');
const { Client } = require('@notionhq/client');

const app = express();
const port = 3000;

// Configura el cliente de Notion
const notion = new Client({
  auth: 'secret_vO7nwV1IHxSW4r8rpUjI6Uh210cjgFlvIy4R9dUQdE2',
});

app.get('/', async (req, res) => {
  try {
    res.send('Ongi etorri cursos de Alberto Mozo');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});


app.get('/cursos', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: '99fe4ba7a31745ac9c762c250ed5c003',
    });
    res.json(response.results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});

app.get('/user', async (req, res) => {
  try {
    const listUsersResponse = await notion.users.list({
    });
    res.json(listUsersResponse.results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});



app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});