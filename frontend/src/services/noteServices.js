/* se va a crear este archivo para simplificar los request que se van a utilizar
en app.jsx 
por lo que se tiene que importar la libreria axios*/
import axios from 'axios'
//se define la base de la direccion del servidor
const baseURL='/api/notes'

//se va a definir el request get mediante axios
const getAll=()=>{
    const request= axios.get(baseURL)
    return request.then(response=>response.data)
}

//se va a definir el request post mediante axios el cual pide la base de la direccion
//y el nuevo objeto que se quiere crear
const create=newObject=>{
    const request= axios.post(baseURL,newObject)
    return request.then(response=>response.data)
}

//se va a definir el request put para editar un objeto existente en el servidor. 
//para eso se necesita el id y la forma de ponerlo en su url es la base +id
// y como se quiere modificar el objeto existente
const update=(id,newObject)=>{
    const request=axios.put(`${baseURL}/${id}`,newObject)
    return request.then(response=>response.data)
    
}
//se exportan las funciones, al momento de importar, se importan todas, por lo tanto para 
//llamar las funciones sera necesario poner noteServices.getAll()....
export default{getAll,create,update}