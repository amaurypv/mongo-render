//se va a importar la libreria mongoose
const mongoose=require('mongoose')

// se define que no se muestre en la consola la version de mongoose
mongoose.set('strictQuery',false)

//se define la direccion de la base de datos obtenida desde mongo atlas esta url se va a tomar desde un archivo .env AUNQUE SE TIENE QUE IMPORTAR TAMBINE UNA LIBRERIA dotenv
require('dotenv').config()
const url=process.env.MONGODB_URI

console.log(`conectandose a ${url}`)

//ahora se conecta a la base de datos. 
mongoose.connect(url)
    .then(result=>{
        console.log(`estas conectado a mongo db`)
    })
    .catch(error=>{
        console.log(`hubo un error al conectar ${error.message}`)
})

//Se crea un esquema que define la estructura de los documentos en la colección "notes". Cada nota tendrá un campo content (texto) y un campo important (booleano).
const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
})

//se define un esquema para eliminar los id y las versiones como vienen en mongo para de esta forma cuando se llame a los elementos solo envie el contenido y la importanci. 
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

//Se crea el modelo y se exporta  basado en el esquema anterior. Esto es lo que usas para interactuar con los datos en la base de datos. mongo db pone el modelo en plural para la coleccion en este caso se llamará "notes" con minuscula y "s" al final
module.exports=mongoose.model('Note', noteSchema)