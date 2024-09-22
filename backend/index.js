require('dotenv').config()
const express= require('express')
const app=express()
//la libreria cors sirve para poder compartir datos en con fuentes externas como 
//puede ser un puerto diferente, una url diferente.
const cors = require('cors')

//se importa el modulo Note desde el archivo note.js
const Note=require('./models/note.js')
const { json } = require('express')
const note = require('./models/note.js')

app.use(express.static('dist'))
app.use(cors())
/*middleware son funciones que tienen acceso al objeto de solicitud (req),
al objeto de respuesta (res) y a la siguiente función de middleware en el ciclo de 
solicitud/respuestas de la aplicación. La siguiente función de middleware se denota normalmente con una variable denominada next.*/

//crear un middelware que imprima la información sobre cada solicitud al servidor
const requestLogger=(req,res,next)=>{
  console.log(`Method: ${req.method}`)
  console.log(`Path: ${req.path}`)
  console.log(`Body: ${req.body}`)
  console.log(`----`)
  next()
}

//para usarlo se pone app.use(nombre_middldeware)
app.use(requestLogger)

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    },
    {
      id: 4,
      content: "express es mucho mas facil",
      important: true
    }
]
// A continuación, definimos dos rutas a la aplicación. 
// El primero define un controlador de eventos,
// que se utiliza para manejar las solicitudes HTTP GET realizadas a la raíz / 
// de la aplicación:

app.get('/',(req,res)=>{
  /* La función del controlador de eventos acepta dos parámetros. 
  El primer parámetro request contiene toda la información de la solicitud HTTP y
  el segundo parámetro response se utiliza para definir cómo se responde a la solicitud.*/
    res.send('<h1>saludos</h1>')

})

//para obtener las notas desde mongo se va a solicitar obtener los datos de la coleccion notes
app.get('/api/notes',(req, res)=>{
    Note.find({}).then(notes=>{res.json(notes)})
})  

//podemos acceder a un recurso en especifico es decir a un elemento de notes.
//usando como referencia el id 
//haciendo un .GET y seleccionando el id del elemento que queremos leer en la direccion 
app.get('/api/notes/:id',(req,res)=>{
  //primero obtenermos el id desde la pagina por eso se ponen los (:)
  //para buscarlos se tiene que utizar el req y params que son los parametros que se tienen en la pagina
  const id = req.params.id
  //se realiza la busqueda en la base de datos de mongo por id con coleccion.findByid().then  
  Note.findById(id).then(
    idEncontrada=>{
    //se va a poner una condicion si se encuentra el id
    if(idEncontrada){
      //entonces envia como resultado el contacto encontrado
    {res.json(idEncontrada)}
    }else{
      //si no se encuentra manda 
      res.status(404).end()
    }
  })
  .catch(error=>{
    console.log(`${error}`)
    res.status(400).send({error:"no coincide con el formato de id"})
  })
})

//ahora agregaremos un metodo para eliminar una nota seleccionada
app.delete('/api/notes/:id', (req, res,next) => {
  //se obtiene el id desde el browser
  const id = req.params.id
  //para eliminar una entrada en mongo usando mongoose se usa findByIdAndDelete()
  Note.findByIdAndDelete(id).then(eliminado=>{
    res.status(202).send(`se elimino ${eliminado}`).end()
  })
  //se envia un mensaje en caso de no encontrar el id
  .catch(error=>next(error))
})

//para agregar notas a nuestra variable notes se usa el request POST
//primero se tiene que agregar el json-parser de express para acceder a los datos de manera
//mas facil
app.use(express.json())

//ahora se hace el request
app.post('/api/notes', (req, res) => {
  //se obtiene los datos a agregar desde el cuerpo en postman
  /*Sin json-parser, la propiedad body no estaría definida. 
  El json-parser funciona para que tome los datos JSON de una solicitud, 
  los transforme en un objeto JavaScript y luego los adjunte a la propiedad body del 
  objeto request antes de llamar al controlador de ruta. */
  //se imprime la nota con la finalidad de ver si se agrego correctamente
  const cuerpo = req.body;
  //primero se comprueba que haya contenido en el body, si no, se envia un mensaje que se tiene que llenar el body para poder proceder
  if(cuerpo.content===undefined){
    return res.status(404).json({error:'no hay contenido'})
  }
 //ahora se va a definir la nueva nota.
 const note=new Note({
  content:cuerpo.content,
  important:cuerpo.important||false
 })
 // y por ultimo se guarda en mongo
 note.save().then(nuevanota=>{
  res.json(nuevanota)
  })
})


//se puede hacer un POST aun mejorado en el que si el cuerpo no tiene contenido 
//envie un error, que si en el cuerpo no se puso importante que envie siempre falso
//primero se define una funcion para definir el id 
const seleccionId=()=>{
  const id=notes.length>0?Math.max(...notes.map(n=>n.id)):0
  return id+1
}


app.post('/api/notesmejorado',(req,res)=>{
  //se define la variable tomando los datos desde el body:
  let cuerpo=req.body
  //si no se cuenta con el contenido desde el body, se manda un error(400)
  if(cuerpo.content===undefined){
    res.status(400).json({error:'note.content no tiene contenido'})
  }else{
  //se va a definir de nuevo la nota, con diferentes condiciones

  const note= new Note({
      content: cuerpo.content,
      important: cuerpo.important || false,
  })
  //se guardar la nueva nota
  note.save().then(
    notaguardada=>{res.json(notaguardada)}
  )
  }
})

//se va agregar un nuevo request para cambiar el contenido de una nota
app.put('/api/notes/:id',(req,res,next)=>{ 
  //se define el id que se toma del param 
  let id=req.params.id
  //se define el cuerpo, de donde se va a tomar la nota
  let cuerpo=req.body
  //ahora se define la nota modificada, en este caso no se va a usar el Note.new porque no se va a generar una nueva nota, solo se tiene que modificar una existente
  nota={
    content:cuerpo.content,
    important:cuerpo.important
  }
  //ahora se va a buscar y modificar la entrada de acuerdo al id que queremos cambiar, y ademas se tiene que agregae la nota definida antes y el objeto {new:true}  que hará que nuestro controlador de eventos sea llamado con el nuevo documento modificado en lugar del original.
Note.findByIdAndUpdate(id,nota,{new:true})
.then(notaMofificada=>{
  res.json(notaMofificada)
})
.catch(error=>next(error))
}
)

//se puede agregar middleware al final para enviar errores
const endpointDesconocido=(req,res,next)=>{
  res.status(404).send({error:'no se encuentra el endpoint'})
}
app.use(endpointDesconocido)
//se define un nuevo manejador de errores usando ahora next()
//Los controladores de errores de Express son middleware que se definen con una función que acepta cuatro parámetros. Nuestro controlador de errores se ve así:

const errorHandler=(error,req,res,next)=>{
  console.error(error.message)
  if(error.name==='CastError'){
    return res.status(400).send({error:'no coincide el formato'})
  }
  next(error)
}

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)

//se utilizar process.env.PORT para que RENDER pueda definir el puerto, 
//si no estamos usando RENDER y no define una variable, entonces tomamos como puerto 
//el numero 3001

const PORT = process.env.PORT||3001
//se ejecuta que xpress pueda ser accesible en todas las interfaces de la red
app.listen(PORT,'0.0.0.0',()=>{
  console.log(`corriendo en el puerto ${PORT}`)
})
