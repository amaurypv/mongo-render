
import Note from './components/Note'
import noteServices from './services/noteServices'
//se va a importar el archivo css para poder modificar las fuentes
//para eso es necesario crear un archivo llamado index.css en la carperta src
import './index.css'
import { useState, useEffect } from 'react'

const App = (props) => {
  const [notes,setNotes]=useState([])
  const [newNote,SetNewNote]=useState('nueva nota ...')
  const [errorMessage, setErrorMEssage]=useState('')
  //tambien se pueden agregar los estilos de forma directa
  //definiendo los estilos como un obbjeto
  const Footer=()=>{
    const footerStyle={
      color:'green',
      fontStyle:'italic',
      fontSize:'16'
    }
    return(
      <div style={footerStyle}>
        <br/> <em>este es un ejemplo de un footer en linea</em>
      </div>
    )
  }
  
  const Notificacion=({message})=>{
    if(message===null){
      return null
    }
    return(
      <div className='error'>
        {message}
      </div>
    )
  }
  const addNote=(event)=>{
    event.preventDefault()
    console.log('button clicked',event.target)
    const noteObject={
      content: newNote,
      important: Math.random()<0.5,
      
    }

    noteServices.create(noteObject)
      .then(returnNote=>{
        setNotes(notes.concat(returnNote))
        SetNewNote('')
      })
  }

  const hook=()=>{
    noteServices.getAll()
    .then(initialNotes=>setNotes(initialNotes))
  }

  useEffect(hook,[])
  
  const cambiarImportancia=(id)=>{
    const note=notes.find(n=>n.id===id)
    const notaNueva={...note, important:!note.important}
    noteServices.update(id,notaNueva)
    .then(returnNote=>{
        const updatedNotes = notes.map(note => note.id !== id ? note : returnNote);
        setNotes(updatedNotes);  // Aquí se actualizaría el estado con la nueva lista de notas
        console.log(`se cambio la importancia del id ${returnNote.id} a ${returnNote.important}`)
      })
      .catch(error=>{
        setErrorMEssage(`Note ${error.content} ya no esta en el servidor`)
        setTimeout(()=>{
          setErrorMEssage(null)},5000)
        })
  }
  const eliminarNota=(id)=>{
    noteServices.eliminar(id).then(respuesta=>console.log(`se elimino ${respuesta}`))
  }

  
  const handleNoteChange=(event)=>{
    SetNewNote(event.target.value)
  }
  
  return (
    <div>
      <h1>Notes</h1>
      <Notificacion message={errorMessage}/>
      <ul>
        {notes.map(note => 
          <Note key={note.id} note={note} cambiarImportancia={()=>cambiarImportancia(note.id)} eliminarNota={()=>eliminarNota(note.id)} />
        )}
      </ul>
      <form onSubmit={addNote}> 
         <input value={newNote} onChange={handleNoteChange}/>
          <button type='submit'> save</button>
      </form>
      <Footer/>
    </div>
  )
}

export default App