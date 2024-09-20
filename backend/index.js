const express= require('express')
const app=express()
//se importa el modulo y se define como Notes
//y se cambia la configuracion de get para que obtenga los datos de mongo.
const Notes=require('./models/note.js')

//la libreria cors sirve para poder compartir datos en con fuentes externas como 
//puede ser un puerto diferente, una url diferente.
const cors = require('cors')
const { json } = require('express')

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

app.get('/api/notes',(req, res)=>{
    Notes.find({})
    .then(notes=>res.json(notes))
})

//podemos acceder a un recurso en especifico es decir a un elemento de notes.
//usando como referencia el id 
//haciendo un .GET y seleccionando el id del elemento que queremos leer en la direccion 
app.get('/api/notes/:id',(req,res)=>{
  //primero se obtiene el id desde el param(de la pagina)
  let id=req.params.id
  //se hace la busqueda en mongo en este caso se usa findById() toma el id como un String, que es lo      correcto para trabajar con los ObjectId de MongoDB.
  Notes.findById(id).then(resultado=>{
    res.json(resultado)
  })
})

//ahora agregaremos un metodo para eliminar una nota seleccionada
app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()  
})

//para agregar notas a nuestra variable notes se usa el request POST
//primero se tiene que agregar el json-parser de express para acceder a los datos de manera
//mas facil
app.use(express.json())

//ahora se hace el request
app.post('/api/notes', (req, res) => {
  let cuerpo=req.body
  //si no se cuenta con el contenido desde el body, se manda un error(400)
  if(cuerpo.content===undefined){
    res.status(400).json({error:' no tiene contenido'})
  }
  //se va a definir de nuevo la nota, con diferentes condiciones
  nota= new Notes({
    content:cuerpo.content,
    important:cuerpo.important||false  
  })
  nota.save().then(
    nuevaNota=>{res.json(nuevaNota)}
  )
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
    res.status(400).json({error:' no tiene contenido'})
  }
  //se va a definir de nuevo la nota, con diferentes condiciones
  nota= new Notes({
    content:cuerpo.content,
    important:cuerpo.important  
  })
  nota.save().then(
    nuevaNota=>{res.json(nuevaNota)}
  )
})

//se puede agregar middleware al final para enviar errores
const endpointDesconocido=(req,res,next)=>{
  res.status(404).send({error:'no se encuentra el endpoint'})
}

app.use(endpointDesconocido)

//se utilizar process.env.PORT para que RENDER pueda definir el puerto, 
//si no estamos usando RENDER y no define una variable, entonces tomamos como puerto 
//el numero 3001
const PORT = process.env.PORT|| 3001
app.listen(PORT,()=>{
  console.log(`corriendo en el puerto ${PORT}`)
})
