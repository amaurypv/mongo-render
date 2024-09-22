const Note = ({ note, cambiarImportancia }) => {
  return (
    <li className="lista1">{note.content}
    {<button onClick={cambiarImportancia}>cambiar</button>}
    {<button onClick={eliminarNota}>Eliminar</button>}
    </li>
  )
}

export default Note