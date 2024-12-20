const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
require('dotenv').config();
const { formatearCurso } = require('./funciones');


// Ahora puedes acceder a las variables de entorno con process.env
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_IDen = process.env.DATABASE_ID;
const URL_BASE = process.env.URL_BASE;
const now = new Date();
const dateTimeString = now.toISOString();

/* console.log(`API Key: ${NOTION_API_KEY}`);
console.log(`Database ID: ${DATABASE_IDen}`); */

const app = express();
app.use(cors());

// Configura el cliente de Notion
const notion = new Client({
  auth: NOTION_API_KEY,
});


// creamos map de categorias
let categoriasMap = new Map() ; // Crear el mapa de categorías
let cursosNombreMap = new Map(); // Crear el mapa de cursos
let categoriasA = [];

// Función para cargar las categorías en el mapa al iniciar la ejecucion
const cargarCategorias = async () => {
  
 console.log('entro en const cargarCategorias');
  try {
    const response = await notion.databases.query({
      database_id: 'd75c7df2c27a49df89bac3d4fc1cc04f',  // ID de tu base de datos de categorías
    });
    // Limpiar el mapa antes de cargar nuevas categorías
    categoriasMap.clear();
    categoriasA = [];
    console.log('entro en try cargarCategorias' + response);
    response.results.forEach(page => {
      const pageId = page.id;
      let name = 'Sin nombre';
      console.log ('pageiid: ' + page );
      if (page.properties.Nombre?.title[0]?.plain_text) {
        name = page.properties.Nombre.title[0].plain_text;
      }
      categoriasMap.set(pageId, name);
      categoriasA[page] = name;
    });

    console.log('Categorías cargadas correctamente:', categoriasMap);
  } catch (error) {
    console.log('Error al cargar las categorías:', error);
  }
  
};

const cargarCursos = async () => {
  console.log('entro en const cargarCursos');
   try {
     const response = await notion.databases.query({
      database_id: '99fe4ba7a31745ac9c762c250ed5c003',
    });
    cursosNombreMap.clear();
    console.log('entro en try cargarCursos' + response);

  
    response.results.forEach(curso =>{ 

      const cursosid = curso.id;
      const nombre = curso.properties.Name.title[0].plain_text;
      //const nombre = 'prueba'
      cursosNombreMap.set(cursosid, nombre); 
        
    });
    console.log('Cursos cargados correctamente:', cursosNombreMap);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
}


/* // Cargar categorías al arrancar el servidor
cargarCategorias();
console.log(categoriasMap);
// Cargar categorías al arrancar el servidor
cargarCursos();
console.log('cursos :  ' + cursosNombreMap); */
const iniciarServidor = async () => {
  try
  {
   await cargarCategorias();
   await cargarCursos();
   
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
  }
  
}; // FIN CONST iniciarServidor
//////
// Llama a la función para cargar los datos y arrancar el servidor
iniciarServidor();





// Ruta principal
app.get('/', async (req, res) => {
  try {
    console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 / 🎯🎯🎯🎯🎯`);
    //res.send('Ongi etorri cursos de Alberto Mozo');
    res.sendFile(__dirname + '/views/index.html'); // Sirve el HTML de la página de inicio
    console.log('------Ongi etorri------------');
    console.log(`API Key: ${NOTION_API_KEY}`);
    console.log(`Database ID: ${DATABASE_IDen}`);
    console.log('categoriasMap ' + categoriasMap.size);
    console.log('cursosNombreMap '  + cursosNombreMap.size);  
    console.log('categoriasA ' + categoriasA.length);
    console.log('----------------------------');
  
  } catch (error) {
    console.error(error);
    
    res.status(500).send('Error al consultar Notion');
  }
});

// Ruta principal
app.get('/cargasync', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 cargasync 🎯🎯🎯🎯🎯`);
  try {
    // Espera a que las variables se carguen completamente
    if (categoriasMap.size === 0 || cursosNombreMap.size === 0) {
      await cargarCategorias();
      await cargarCursos();
    }

    res.sendFile(__dirname + '/views/index.html'); // Sirve el HTML de la página de inicio
    console.log('------Ongi etorri------------');
    console.log(`API Key: ${NOTION_API_KEY}`);
    console.log(`Database ID: ${DATABASE_IDen}`);
    console.log('categoriasMap ' + categoriasMap.size);
    console.log('cursosNombreMap '  + cursosNombreMap.size);  
    console.log('categoriasA ' + categoriasA.length);
    console.log('----------------------------');

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});

// Ruta para consultar cursos
app.get('/cursos', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 cursos 🎯🎯🎯🎯🎯`);
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

app.get('/cursos2', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 cursos2 🎯🎯🎯🎯🎯`);
  try {
    const response = await notion.databases.query({
      database_id: '99fe4ba7a31745ac9c762c250ed5c003',
    });
    let cursos = []
  
    response.results.forEach(curso =>{ 
        cursos.push(formatearCurso(curso,categoriasMap));
    });
    res.json(cursos);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});


// Ruta para consultar un curso por ID
app.get('/search/cursos/:nombre', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 /search/cursos/:nombre 🎯🎯🎯🎯🎯`);
  const cursoId = req.params.nombre; 
   // Captura el id desde la URL
   console.log(':nombre ' + cursoId);
  try {
    const response = await notion.databases.query({
      database_id: '99fe4ba7-a317-45ac-9c76-2c250ed5c003',  // ID de tu base de datos
      filter: {
        property: 'Name',  // Campo en Notion que quieres filtrar (ajústalo según tu base de datos)
        title: {
          //equals: cursoId  // Filtra por el valor del curso (id o nombre)
          contains: cursoId  // Filtra por el valor del curso (id o nombre)

        }
      }
    });

    if (response.results.length === 0) {
      return res.status(404).send('Curso no encontrado');
    } else {
        // Mostrar lo cursos
        const resultado = [];
        response.results.forEach(curso => {
          console.log('curso : ' + curso)
          resultado.push(formatearCurso(curso,categoriasMap));
        }
        )
        res.json(resultado);




    }

    // Extraer y formatear los datos del curso
   /*  const curso = {
      id: response.results[0].id,
      name: response.results[0].properties.Name.title[0].plain_text,
      status: response.results[0].properties.Status.select.name,
      descripcion: response.results[0].properties.Caracteristicas.rich_text[0]?.plain_text || '',
      enlace: response.results[0].properties.enlace.url || '',
      url_notion: response.results[0].url
    };

    res.json(curso);  // Devuelve la información del curso en formato JSON */
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});


/* cursos que queremos se vean en internet */
app.get('/cursosweb2', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 cursosweb2 🎯🎯🎯🎯🎯`);
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer secret_vO7nwV1IHxSW4r8rpUjI6Uh210cjgFlvIy4R9dUQdE2");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Notion-Version", "2022-02-22");
  myHeaders.append("Cookie", "__cf_bm=HorS1OcJh_B8aBmLBYvnSe7atFAUZPTDmzchHMTl_GE-1728905262-1.0.1.1-VPCKwwY1pKJGh0voY_62OF0.0.e3I38kHrMFvTskdE7wZAR6SX1NZzL3iU7cc4am.vp_SRFC8PnoLpJEP4V9nw; _cfuvid=UV7lie.TmRwIF_SVMXZxDopnIZ8nHt2AQT38mxq1YEE-1728905262909-0.0.1.1-604800000");

  const raw = JSON.stringify({
    "filter": {
      "property": "Web",
      "checkbox": {
        "equals": true
      }
    },
    "sorts": [
      {
        "property": "Name",
        "direction": "ascending"
      }
    ]
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  let cursos = [];

  fetch("https://api.notion.com/v1/databases/99fe4ba7a31745ac9c762c250ed5c003/query", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      //console.log(result);
      //res.json(result);
      result.results.forEach(curso =>{
        console.log(curso);
        console.log(curso.id);
        console.log(curso.properties.horas.number);
        console.log(curso.properties.enlace.url);
        console.log(curso.properties.Name.title[0].plain_text);
        console.log(curso.properties.Caracteristicas.rich_text[0]?.plain_text);
        console.log(curso.properties.categorias.relation[0].id);
        console.log(categoriasMap.get(curso.properties.categorias.relation[0].id));
        //
        let cursoId = curso.id;
        let horas = curso.properties.horas.number;
        const enlace = curso.properties.enlace.url;
        const nombre = curso.properties.Name.title[0].plain_text;
        const caracteristicas = curso.properties.Caracteristicas.rich_text[0]?.plain_text;
        const categoriaId = curso.properties.categorias.relation[0].id;
        const categoriaNombre = categoriasMap.get(curso.properties.categorias.relation[0].id);




        console.log('-------');
        cursos.push({
          cursoid : cursoId,
          nombre : nombre,
          horas : horas,
          caracteristicas : caracteristicas, 
          enlace : enlace,
          categoriaId : categoriaId,
          categoriaNombre : categoriaNombre       
        });

      })
      res.json(cursos);

    })
    .catch((error) => {
      console.error(error);
    });
});

app.get('/cursosweb', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 cursosweb 🎯🎯🎯🎯🎯`);
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer secret_vO7nwV1IHxSW4r8rpUjI6Uh210cjgFlvIy4R9dUQdE2");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Notion-Version", "2022-02-22");
  myHeaders.append("Cookie", "__cf_bm=HorS1OcJh_B8aBmLBYvnSe7atFAUZPTDmzchHMTl_GE-1728905262-1.0.1.1-VPCKwwY1pKJGh0voY_62OF0.0.e3I38kHrMFvTskdE7wZAR6SX1NZzL3iU7cc4am.vp_SRFC8PnoLpJEP4V9nw; _cfuvid=UV7lie.TmRwIF_SVMXZxDopnIZ8nHt2AQT38mxq1YEE-1728905262909-0.0.1.1-604800000");

  const raw = JSON.stringify({
    "filter": {
      "property": "Web",
      "checkbox": {
        "equals": true
      }
    },
    "sorts": [
      {
        "property": "Name",
        "direction": "ascending"
      }
    ]
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  let cursos = [];

  fetch("https://api.notion.com/v1/databases/99fe4ba7a31745ac9c762c250ed5c003/query", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      //console.log(result);
      //res.json(result);
      result.results.forEach(curso =>{
        console.log(curso);
      /*   console.log(curso.id);
        console.log(curso.properties.horas.number);
        console.log(curso.properties.enlace.url);
        console.log(curso.properties.Name.title[0].plain_text);
        console.log(curso.properties.Caracteristicas.rich_text[0]?.plain_text);
        console.log(curso.properties.categorias.relation[0].id);

        console.log(categoriasMap.get(curso.properties.categorias.relation[0].id)); */
        console.log('status (select): ' + curso.properties.Status.select.name);
        console.log('Tipo (multi_select) : ' + curso.properties.Tipo.multi_select);
        let Tipos = [];
        curso.properties.Tipo.multi_select.forEach(tipo => {
          Tipos.push(tipo.name);
        });
        console.log('CERTIFICADO (multi_select) : ' + curso.properties.CERTIFICADO.multi_select);
        let Certificados = [];
        curso.properties.CERTIFICADO.multi_select.forEach(certificado => {
          Certificados.push(certificado.name);
        });
        
        console.log('created_time (fecha) : ' + curso.created_time);          
        let imagen;
        if (curso.properties.portada.files[0]?.type == undefined) 
          {imagen = 'pordefecto'} 
        else {
          if (curso.properties.portada.files[0].type== "file"){
            imagen = curso.properties.portada.files[0].file.url;
          }else {
            console.log('external' + curso.properties.portada.files[0].type)
            imagen = curso.properties.portada.files[0].external.url;
            
          }
        
        }





        let cursoId = curso.id;
        let horas = curso.properties.horas.number;
        const enlace = curso.properties.enlace.url;
        const nombre = curso.properties.Name.title[0].plain_text;
        const caracteristicas = curso.properties.Caracteristicas.rich_text[0]?.plain_text;
        const categoriaId = curso.properties.categorias.relation[0].id;
        const categoriaNombre = categoriasMap.get(curso.properties.categorias.relation[0].id);
        const precio = curso.properties.precio.number;
        const oferta = curso.properties.oferta.number;
        const notion_public_url = curso.public_url;
        const created_time = curso.created_time;
        const github = curso.properties.github.url;




        console.log('-------');
        cursos.push({
          cursoid : cursoId,
          materia : nombre,
          horas : horas,
          caracteristicas : caracteristicas, 
          url : enlace,
          imagen : imagen,
          precio : precio,
          categoria : categoriaId,
          categoriaNombre : categoriaNombre,
          oferta : oferta,
          notion_public_url : notion_public_url,
          created_time : created_time,
          tipos : Tipos,
          github : github,
          certificados : Certificados
         });

      })
      res.json(cursos);

    })
    .catch((error) => {
      console.error(error);
    });
});


// Ruta para consultar un curso por ID
app.get('/cursosid/:id', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 cursosid/:id 🎯🎯🎯🎯🎯`);
  const cursoId = req.params.id;  // Captura el id desde la URL
  try {
    const response = await notion.databases.query({
      database_id: '99fe4ba7-a317-45ac-9c76-2c250ed5c003',  // ID de tu base de datos
      filter: {
         // Campo en Notion que quieres filtrar (ajústalo según tu base de datos)
        id: {
          equals: cursoId  // Filtra por el valor del curso (id)
        }
      }
    });

    if (response.results.length === 0) {
      return res.status(404).send('Curso ' + cursoId +' no encontrado');
    }

    // Extraer y formatear los datos del curso
   /*  const curso = {
      id: response.results[0].id,
      name: response.results[0].properties.Name.title[0].plain_text,
      status: response.results[0].properties.Status.select.name,
      descripcion: response.results[0].properties.Caracteristicas.rich_text[0]?.plain_text || '',
      enlace: response.results[0].properties.enlace.url || '',
      url_notion: response.results[0].url
    };

    res.json(curso);  // Devuelve la información del curso en formato JSON */
    res.json(response)
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar curso ' + cursoId +' Notion');
  }
});


// Ruta para consultar usuarios
app.get('/user', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 user 🎯🎯🎯🎯🎯`);
  try {
    const listUsersResponse = await notion.users.list();
    res.json(listUsersResponse.results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});

/* app.get('/categorias', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: 'd75c7df2c27a49df89bac3d4fc1cc04f',
    });
    res.json(response.results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion /(categorias)');
  }
}); */



 

// Ruta para obtener las categorías
app.get('/categorias', async (req, res) => { 
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 categorias 🎯🎯🎯🎯🎯`);

  try {
    const response = await notion.databases.query({
      database_id: 'd75c7df2c27a49df89bac3d4fc1cc04f',  // ID de tu base de datos
      //database_id: '121add6e20d14737b018064e3f08ca65',  // ID de tu base de datos
    
    });
    //console.log(response.results)
    // Crear un array de categorías en formato { 'id': 'Name' }
    let categorias = [];
    response.results.forEach(async (page) => {
      const pageId = page.id;

      let name = 'kkk';
      console.log(page)
      console.log('----------');

     console.log(page.properties.Nombre.title[0].plain_text);
      //if (page.properties.Name.title[0].plain_text !== undefined && page.properties.Name.title[0].plain_text !== '') {
        if (page.properties.Nombre?.title[0]?.plain_text) {
       name = page.properties.Nombre.title[0].plain_text;
       console.log(name)
      } else {
        console.log ('error name : ' + pageId)
      }
    
      categorias.push({
        pageId,
        name: name,
      });
  
      




    });

    // Enviar las categorías como respuesta
   console.log(categorias);
    res.json(categorias)
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});

// Ruta para obtener las categorías
app.get('/categoriascursos', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 categoriacursos 🎯🎯🎯🎯🎯`);
  
  try {''
   
    // Espera a que las variables se carguen completamente
    if (categoriasMap.size === 0 || cursosNombreMap.size === 0) {
      console.log('❓ Mapear');
      await cargarCategorias();
      await cargarCursos();
    }
    const response = await notion.databases.query({
      database_id: 'd75c7df2c27a49df89bac3d4fc1cc04f',  // ID de tu base de datos
      //database_id: '121add6e20d14737b018064e3f08ca65',  // ID de tu base de datos
    
    });
    //console.log(response.results)
    // Crear un array de categorías en formato { 'id': 'Name' }
    let categorias = [];
    response.results.forEach(async (page) => {
      const pageId = page.id;

      let name = 'kkk';
      //console.log(page)
      console.log('----------');

      console.log(page.properties.Nombre.title[0].plain_text);
      //if (page.properties.Name.title[0].plain_text !== undefined && page.properties.Name.title[0].plain_text !== '') {
      if (page.properties.Nombre?.title[0]?.plain_text) {
        name = page.properties.Nombre.title[0].plain_text;
        console.log(name)
      } else {
        console.log ('error name : ' + pageId)
      }

      const cursos = [];
      //console.log(page.properties['✔️ CURSOS'].relation);
      console.log('num cursos : ' + page.properties['✔️ CURSOS']?.relation.length);  
      page.properties['✔️ CURSOS']?.relation.forEach(curso => {
        console.log('curso nombre : ' + cursosNombreMap.get(curso.id));
        const nombrecurso = cursosNombreMap.get(curso.id);
        const cursoItem = {
          id : curso.id,
          nombre : nombrecurso
        };
        //console.log(cursoItem);
        cursos.push(cursoItem);
        //console.log('😀'+ curso);
      })



    
      categorias.push({
        pageId,
        name: name,
        cursos : cursos
      });
  
      




    });

    // Enviar las categorías como respuesta
   //console.log(categorias);
    res.json(categorias)
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});




app.get('/search/categoria/:search', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 search/categoria/:search 🎯🎯🎯🎯🎯`);
  const search = req.params.search;  // Captura el id desde la URL
  const resultados = [];
  console.log(categoriasMap);
  // buscar en en categoriaMap  por id or nombre
  if (categoriasMap.get(search))
  {
   
    let categoriaNombre = categoriasMap.get(categoriaId);
    resultados.push({ search, categoriaNombre });

  } else {
    
  
    categoriasMap.forEach((valor, clave) => {
      if (valor.toLowerCase().includes(search.toLowerCase())) {
        resultados.push({ clave, valor });
      }
    });
    if (resultados.length === 0) {
        resultados.push({ 'busqueda categoria': 'no encontrado' });
    } 
  }

  // Si existe mostrar los valores y buscar los cursos por campo relation categoria

  res.json(resultados);

});



app.get('/categorias/cursos2', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 categorias/cursos2 🎯🎯🎯🎯🎯`);
  try {
    const response = await notion.databases.query({
      database_id: 'd75c7df2c27a49df89bac3d4fc1cc04f',  // ID de tu base de datos
    });

    console.log(response.results);
    // Crear un array de categorías en formato { 'id': 'Name' }
    let categorias = {};
    
    // Usar un bucle `for...of` para manejar correctamente `await`
    for (const page of response.results) {
      const id = page.id;
      let name = 'kkk';
      if (page.properties.Nombre?.title[0]?.plain_text) {
        name = page.properties.Nombre.title[0].plain_text;
      } else {
        console.log('Error name: ' + id);
      }
      categorias.push({
        id,
        nombre: name
    
      });

      //categorias[id] = name;
      //console.log(id + ' - ' + name);

      // Recorrer la relación de cursos
      const cursos = page.properties['✔️ CURSOS'].relation;

      // Usar otro bucle `for...of` para manejar `await` con los cursos
      for (const curso of cursos) {
        let cursoId = curso.id;
        //console.log(cursoId);

        try {
          // Ahora `notion.pages.retrieve` es asíncrona correctamente con `await`
          const cursoResponse = await notion.pages.retrieve({ page_id: cursoId });
          console.log(cursoResponse);  // Mostrar la respuesta del curso
          // Puedes agregar lógica para procesar el cursoResponse si lo necesitas
          const cursoNombre = cursoResponse.properties.Name.title[0].plain_text;
          const cursoUrl = cursoResponse.properties.enlace.url
          
          console.log(cursoId, cursoNombre, cursoUrl);
        } catch (error) {
          console.error('Error al obtener el registro:', error);
        }
      }
    }

    // Enviar las categorías como respuesta
    console.log(categorias);
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});

app.get('/categorias/cursos', async (req, res) => {
  console.log(`[${dateTimeString}] 🎯🎯🎯🎯🎯 categoria/cursos 🎯🎯🎯🎯🎯`);
  try {
  
    const response = await notion.databases.query({
      database_id: 'd75c7df2c27a49df89bac3d4fc1cc04f',  // ID de tu base de datos
    });

    console.log(response.results);
    
    // Crear un array de categorías con sus cursos
    let categorias = [];
    
    // Usar un bucle `for...of` para manejar correctamente `await`
    for (const page of response.results) {
      const categoriaId = page.id;
      let nombreCategoria = 'kkk';
      
      if (page.properties.Nombre?.title[0]?.plain_text) {
        nombreCategoria = page.properties.Nombre.title[0].plain_text;
      } else {
        console.log('Error name: ' + categoriaId);
      }
      
      // Inicializar un array para los cursos asociados a esta categoría
      let cursos = [];

      // Recorrer la relación de cursos
      const cursosRelacion = page.properties['✔️ CURSOS'].relation;

      // Usar otro bucle `for...of` para manejar `await` con los cursos
      for (const curso of cursosRelacion) {
        let cursoId = curso.id;

        try {
          // Obtener los detalles del curso
          const cursoResponse = await notion.pages.retrieve({ page_id: cursoId });
          
          // Extraer la información que necesites del curso
          const cursoNombre = cursoResponse.properties.Name?.title[0]?.plain_text || 'Sin nombre';
          const cursoUrl = cursoResponse.properties.enlace?.url || 'Sin enlace';

          // Agregar el curso al array de cursos
          cursos.push({
            cursoId,
            nombre: cursoNombre,
            enlace: cursoUrl
          });

          console.log(cursoId, cursoNombre, cursoUrl);
        } catch (error) {
          console.error('Error al obtener el registro del curso:', error);
        }
      }

      // Agregar la categoría con sus cursos al array de categorías
      categorias.push({
        categoriaId,
        nombreCategoria,
        cursos
      });
    }

    // Enviar las categorías con los cursos como respuesta en formato JSON
    console.log(categorias);
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar Notion');
  }
});









// Exporta el servidor para que lo maneje Vercel
module.exports = app;
