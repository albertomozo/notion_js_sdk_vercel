// Función para formatear un curso en JSON
export function formatearCurso(curso, categoriasMap) {
    let Tipos = [];
      curso.properties.Tipo.multi_select.forEach(tipo => {
        Tipos.push(tipo.name);
      });
      console.log('CERTIFICADO (multi_select) : ' + curso.properties.CERTIFICADO.multi_select);
      let Certificados = [];
      curso.properties.CERTIFICADO.multi_select.forEach(certificado => {
        Certificados.push(certificado.name);
      });
      
      //console.log('created_time (fecha) : ' + curso.created_time);          
      let imagen;
      if (curso.properties.portada.files[0]?.type == undefined) 
        {imagen = 'pordefecto'} 
      else {
        if (curso.properties.portada.files[0].type== "file"){
          imagen = curso.properties.portada.files[0].file.url;
        }else {
          //console.log('external' + curso.properties.portada.files[0].type)
          imagen = curso.properties.portada.files[0].external.url;
          
        }
      
      }





      let cursoId = curso.id;
      let horas = curso.properties.horas.number;
      const enlace = curso.properties.enlace.url;
      const nombre = curso.properties.Name.title[0].plain_text;
      const caracteristicas = curso.properties.Caracteristicas.rich_text[0]?.plain_text;
      const categoriaId = curso.properties.categorias.relation[0]?.id;
      const categoriaNombre = categoriasMap.get(curso.properties.categorias.relation[0]?.id);
      const precio = curso.properties.precio.number;
      const oferta = curso.properties.oferta.number;
      const notion_public_url = curso.public_url;
      const created_time = curso.created_time;
      const github = curso.properties.github.url;
       
      return {
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
     }
  
   
}


