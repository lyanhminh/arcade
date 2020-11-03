

saveHandler = function(e){
    document.getElementById('score').value = gameCanvas.score
    document.getElementById('id_user').value = document.getElementById('user').value
    document.getElementById('id_game').value = document.getElementById('game').value
    document.getElementById('form').submit()
}

document.getElementById('save')?.addEventListener('click', saveHandler)
