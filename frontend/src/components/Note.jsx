const Note = ({ note, cambiarImportancia,eliminarNota }) => {
  return (
    <li className="lista1">{note.content}
    {<button onClick={cambiarImportancia}>cambiar</button>}
    {<button onClick={eliminarNota}>Eliminar</button>}
    </li>
  )
}

export default Note