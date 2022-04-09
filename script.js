
var board = new WordleBoard("#wordle-board", 5, 6);

board.drawBoard();

$(document).ready(function(){
	$(document).keydown(function(e){
		var charCode = e.keyCode || e.which;
		if(charCode >= 65 && charCode <= 90) {
			board.typeLetter(String.fromCharCode(charCode));
		}
		else if(charCode == 8) {
			board.removeLetter();
		}
		else if(charCode == 13) {
			if(!board.completed) {
				board.makeGuess();
			}
			else {
				board.resetGame();
			}
		}
	});
});