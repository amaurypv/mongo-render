const Note = ({ note, cambiarImportancia }) => {
  return (
    <li className="lista1">{note.content}{
      <button onClick={cambiarImportancia}>cambiar</button>
    }</li>
  )
}

export default Note